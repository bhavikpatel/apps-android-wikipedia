package org.wikipedia.savedpages;

import android.content.Context;
import com.squareup.okhttp.OkHttpClient;
import org.wikipedia.Utils;
import org.wikipedia.concurrency.ExecutorService;
import org.wikipedia.concurrency.SaneAsyncTask;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

public class DownloadImageTask extends SaneAsyncTask<Boolean> {
    private final Context context;
    private final URL imageUrl;

    public DownloadImageTask(Context context, String imageUrl) {
        super(ExecutorService.getSingleton().getExecutor(DownloadImageTask.class, 4));
        this.context = context;
        try {
            this.imageUrl = new URL(imageUrl);
        } catch (MalformedURLException e) {
            // Stupid Java is stupid.
            throw new RuntimeException(e);
        }
    }

    @Override
    public Boolean performTask() throws Throwable {
        OkHttpClient client = new OkHttpClient();
        HttpURLConnection conn = client.open(imageUrl);
        InputStream in = conn.getInputStream();
        OutputStream out = context.openFileOutput(Utils.imageUrlToFileName(imageUrl.toString()), Context.MODE_PRIVATE);

        byte[] buffer = new byte[1024 * 16];
        int len;

        while ((len = in.read(buffer)) != -1) {
            out.write(buffer, 0, len);
        }
        in.close();
        out.close();

        return true;
    }
}