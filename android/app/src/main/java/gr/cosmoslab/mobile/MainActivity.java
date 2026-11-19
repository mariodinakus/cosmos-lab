package gr.cosmoslab.mobile;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.Toast;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.net.URLConnection;
import java.util.Locale;
import org.json.JSONObject;

/**
 * COSMOS LAB Android shell.
 *
 * All physics models run in the deployed website's JavaScript. No third-party
 * page is allowed inside the privileged WebView.
 *
 * CSV/PNG/JSON exports generated as blob: URLs are transferred into Android
 * Downloads with an origin-checked JavaScript bridge. Never add untrusted
 * frames or arbitrary origins to the privileged WebView.
 */
public final class MainActivity extends Activity {

    private static final String START_URL = "https://cosmos-lab-v3.vercel.app/hub.html";
    private static final String TRUSTED_HOST = "cosmos-lab-v3.vercel.app";
    private static final int FILE_PICKER_REQUEST = 2003;
    private static final int MAX_BLOB_BYTES = 20 * 1024 * 1024;

    private WebView webView;
    private ProgressBar loadingProgress;
    private View errorPanel;
    private ValueCallback<Uri[]> pendingFileCallback;
    private boolean mainFrameFailed;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(0xff080e11);
        getWindow().setNavigationBarColor(0xff080e11);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        loadingProgress = findViewById(R.id.loading_progress);
        errorPanel = findViewById(R.id.error_panel);
        Button retry = findViewById(R.id.retry);
        retry.setOnClickListener(v -> {
            errorPanel.setVisibility(View.GONE);
            mainFrameFailed = false;
            webView.loadUrl(START_URL);
        });

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Required for Android file chooser.
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        webView.setWebViewClient(new CosmosWebViewClient());
        webView.setWebChromeClient(new CosmosChromeClient());
        webView.addJavascriptInterface(new CosmosFileExporter(), "CosmosSave");

        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent,
                    String contentDisposition, String mimeType, long contentLength) {
                if (!isTrusted(webView.getUrl())) {
                    toast(R.string.download_failed);
                    return;
                }
                if (url != null && url.startsWith("blob:")) {
                    downloadBlob(url);
                    return;
                }
                if (url != null && url.startsWith("https://")) {
                    downloadHttps(url, userAgent, contentDisposition, mimeType);
                } else {
                    toast(R.string.download_failed);
                }
            }
        });

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(START_URL);
        }
    }

    private static boolean isTrusted(String rawUrl) {
        if (rawUrl == null) return false;
        Uri uri = Uri.parse(rawUrl);
        return "https".equalsIgnoreCase(uri.getScheme())
                && TRUSTED_HOST.equalsIgnoreCase(uri.getHost())
                && (uri.getPort() == -1 || uri.getPort() == 443);
    }

    private void openOutside(Uri uri) {
        if (uri == null) return;
        String scheme = uri.getScheme();
        if (scheme == null) return;
        if (!(scheme.equalsIgnoreCase("https")
                || scheme.equalsIgnoreCase("http")
                || scheme.equalsIgnoreCase("mailto")
                || scheme.equalsIgnoreCase("tel"))) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ex) {
            toast(R.string.download_failed);
        }
    }

    private final class CosmosWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (isTrusted(uri.toString())) return false;
            if (request.isForMainFrame()) openOutside(uri);
            return true;
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            mainFrameFailed = false;
            errorPanel.setVisibility(View.GONE);
            loadingProgress.setVisibility(View.VISIBLE);
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request,
                WebResourceError error) {
            if (request.isForMainFrame()) {
                mainFrameFailed = true;
                errorPanel.setVisibility(View.VISIBLE);
                loadingProgress.setVisibility(View.GONE);
            }
        }

        @Override
        public void onReceivedHttpError(WebView view, WebResourceRequest request,
                WebResourceResponse response) {
            if (request.isForMainFrame() && response.getStatusCode() >= 400) {
                mainFrameFailed = true;
                errorPanel.setVisibility(View.VISIBLE);
                loadingProgress.setVisibility(View.GONE);
            }
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            loadingProgress.setVisibility(View.GONE);
            if (mainFrameFailed) return;
            if (isTrusted(url)) installNativeBlobDownloadSupport();
        }
    }

    private final class CosmosChromeClient extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView view, int newProgress) {
            loadingProgress.setProgress(newProgress);
            loadingProgress.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
        }

        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                FileChooserParams chooserParams) {
            if (!isTrusted(view.getUrl())) {
                callback.onReceiveValue(null);
                return true;
            }
            if (pendingFileCallback != null) pendingFileCallback.onReceiveValue(null);
            pendingFileCallback = callback;
            try {
                Intent intent = chooserParams.createIntent();
                startActivityForResult(Intent.createChooser(intent,
                        getString(R.string.choose_file)), FILE_PICKER_REQUEST);
                return true;
            } catch (ActivityNotFoundException | SecurityException e) {
                pendingFileCallback.onReceiveValue(null);
                pendingFileCallback = null;
                return true;
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_PICKER_REQUEST) return;
        if (pendingFileCallback != null) {
            pendingFileCallback.onReceiveValue(
                    WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            pendingFileCallback = null;
        }
    }

    /**
     * Intercept the existing COSMOS app's dynamically generated <a download>
     * links. Blob content exists only in WebView memory and is not available to
     * Android's DownloadManager. Only inject on the trusted first-party origin.
     */
    private void installNativeBlobDownloadSupport() {
        String js =
            "(function(){" +
            "if(window.__COSMOS_NATIVE_EXPORTS__)return;" +
            "window.__COSMOS_NATIVE_EXPORTS__=true;" +
            "var orig=HTMLAnchorElement.prototype.click;" +
            "HTMLAnchorElement.prototype.click=function(){" +
            "var a=this;" +
            "if(a.download&&a.href&&a.href.indexOf('blob:')===0){" +
            "fetch(a.href).then(function(r){return r.blob();}).then(function(b){" +
            "if(b.size>20971520)throw new Error('Export exceeds 20 MB');" +
            "var fr=new FileReader();" +
            "fr.onload=function(){" +
            "var raw=String(fr.result||''),i=raw.indexOf(',');" +
            "if(i>=0)window.CosmosSave.saveBase64(a.download,b.type||'application/octet-stream',raw.substring(i+1));" +
            "};fr.readAsDataURL(b);" +
            "}).catch(function(e){console.error('COSMOS export:',e);});" +
            "return;" +
            "}" +
            "return orig.apply(this,arguments);" +
            "};" +
            "})()";
        webView.evaluateJavascript(js, null);
    }

    private void downloadBlob(String url) {
        String quoted = JSONObject.quote(url);
        String js = "(function(){fetch(" + quoted + ").then(function(r){return r.blob();})" +
                ".then(function(b){if(b.size>20971520)return;" +
                "var f=new FileReader();f.onload=function(){var raw=String(f.result||'');" +
                "var at=raw.indexOf(',');if(at>=0)window.CosmosSave.saveBase64(" +
                "'COSMOS-export',b.type||'application/octet-stream',raw.substring(at+1));};" +
                "f.readAsDataURL(b);}).catch(function(e){console.error(e);});})()";
        webView.evaluateJavascript(js, null);
    }

    /**
     * Called from WebView's JavaScript worker thread.
     * The origin check, MIME allowlist, file size and filename normalization
     * prevent unrelated Web content from writing arbitrary content and paths.
     */
    private final class CosmosFileExporter {
        @JavascriptInterface
        public void saveBase64(String filename, String mime, String base64) {
            if (!isTrusted(webView.getUrl()) || base64 == null ||
                    base64.length() > (MAX_BLOB_BYTES * 4L / 3L + 32L)) return;

            String safeMime = mime == null ? "" : mime.split(";")[0].toLowerCase(Locale.ROOT);
            if (!(safeMime.equals("image/png") || safeMime.equals("image/jpeg")
                    || safeMime.equals("application/json") || safeMime.equals("text/csv")
                    || safeMime.equals("text/plain") || safeMime.equals("application/octet-stream"))) {
                return;
            }

            String safeName = safeFileName(filename, safeMime);
            try {
                byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                if (bytes.length > MAX_BLOB_BYTES) return;
                saveFile(safeName, safeMime, bytes);
                toast(R.string.download_saved);
            } catch (Exception ex) {
                toast(R.string.download_failed);
            }
        }
    }

    private static String safeFileName(String name, String mime) {
        String s = name == null ? "COSMOS-export" : name;
        s = s.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (s.length() > 90) s = s.substring(0, 90);
        if (s.startsWith(".") || s.isEmpty()) s = "COSMOS-export";
        if (!s.contains(".")) {
            if (mime.equals("image/png")) s += ".png";
            else if (mime.equals("image/jpeg")) s += ".jpg";
            else if (mime.equals("application/json")) s += ".json";
            else if (mime.equals("text/csv")) s += ".csv";
            else s += ".txt";
        }
        return s;
    }

    private void saveFile(String name, String mime, byte[] bytes) throws Exception {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
            values.put(MediaStore.MediaColumns.MIME_TYPE, mime);
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/COSMOS");
            values.put(MediaStore.MediaColumns.IS_PENDING, 1);
            Uri saved = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (saved == null) throw new IllegalStateException("MediaStore insert failed");
            try {
                try (OutputStream os = getContentResolver().openOutputStream(saved)) {
                    if (os == null) throw new IllegalStateException("Output stream missing");
                    os.write(bytes);
                }
                ContentValues done = new ContentValues();
                done.put(MediaStore.MediaColumns.IS_PENDING, 0);
                getContentResolver().update(saved, done, null, null);
            } catch (Exception ex) {
                getContentResolver().delete(saved, null, null);
                throw ex;
            }
        } else {
            File downloads = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "COSMOS");
            if (!downloads.exists() && !downloads.mkdirs()) throw new IllegalStateException("Cannot create folder");
            try (FileOutputStream out = new FileOutputStream(new File(downloads, name))) {
                out.write(bytes);
            }
        }
    }

    private void downloadHttps(String url, String agent, String disposition, String mime) {
        try {
            if (!isTrusted(webView.getUrl())) return;
            Uri uri = Uri.parse(url);
            if (!"https".equalsIgnoreCase(uri.getScheme())) return;

            String name = safeFileName(URLUtil.guessFileName(url, disposition, mime),
                    mime == null ? "application/octet-stream" : mime.split(";")[0]);
            DownloadManager.Request request = new DownloadManager.Request(uri);
            request.setTitle(name);
            request.setDescription("COSMOS LAB");
            request.setMimeType(mime);
            if (agent != null) request.addRequestHeader("User-Agent", agent);
            if (TRUSTED_HOST.equalsIgnoreCase(uri.getHost())) {
                String cookie = CookieManager.getInstance().getCookie(url);
                if (cookie != null) request.addRequestHeader("Cookie", cookie);
            }
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "COSMOS/" + name);
            } else {
                request.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, name);
            }
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            dm.enqueue(request);
        } catch (Exception e) {
            toast(R.string.download_failed);
        }
    }

    private void toast(int resId) {
        runOnUiThread(() -> Toast.makeText(MainActivity.this, resId, Toast.LENGTH_LONG).show());
    }

    @Override
    public void onBackPressed() {
        if (errorPanel.getVisibility() == View.VISIBLE) {
            errorPanel.setVisibility(View.GONE);
            webView.loadUrl(START_URL);
        } else if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        webView.saveState(out);
        super.onSaveInstanceState(out);
    }

    @Override
    protected void onDestroy() {
        if (pendingFileCallback != null) {
            pendingFileCallback.onReceiveValue(null);
            pendingFileCallback = null;
        }
        webView.removeJavascriptInterface("CosmosSave");
        webView.destroy();
        super.onDestroy();
    }
}
