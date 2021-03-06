package org.wikipedia.page.gallery;

import org.json.JSONException;
import org.json.JSONObject;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class GalleryItem {
    private final String name;
    public String getName() { return name; }

    private final String url;
    public String getUrl() { return url; }

    private final String mimeType;
    public String getMimeType() { return mimeType; }

    private final HashMap<String, String> metadata;
    public Map<String, String> getMetadata() { return metadata; }

    private final String thumbUrl;
    public String getThumbUrl() { return thumbUrl; }

    private final int width;
    public int getWidth() { return width; }

    private final int height;
    public int getHeight() { return height; }

    public GalleryItem(String name) {
        this.name = name;
        this.url = null;
        this.mimeType = "*/*";
        this.thumbUrl = null;
        this.metadata = null;
        this.width = 0;
        this.height = 0;
    }

    public GalleryItem(JSONObject json) throws JSONException {
        this.name = json.getString("title");
        JSONObject imageinfo = (JSONObject)json.getJSONArray("imageinfo").get(0);
        this.url = imageinfo.optString("url", "");
        this.mimeType = imageinfo.getString("mime");
        this.thumbUrl = imageinfo.optString("thumburl", "");
        this.width = imageinfo.getInt("width");
        this.height = imageinfo.getInt("height");
        metadata = new HashMap<>();
        JSONObject extmetadata = imageinfo.optJSONObject("extmetadata");
        if (extmetadata != null) {
            Iterator<String> keys = extmetadata.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                metadata.put(key, extmetadata.getJSONObject(key).getString("value"));
            }
        }
    }
}
