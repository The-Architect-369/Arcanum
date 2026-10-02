package android.content;
import java.util.HashMap;
import java.util.Map;
import android.os.Parcelable;
/** Host-only callback payload adapter; no broadcasts or activities. */
public class Intent {
  private String action;
  private final Map<String,Object> extras = new HashMap<>();
  public Intent() {}
  public Intent setAction(String value) { action=value; return this; }
  public String getAction() { return action; }
  public Intent putExtra(String key,String value) { extras.put(key,value);return this; }
  public Intent putExtra(String key,int value) { extras.put(key,value);return this; }
  public String getStringExtra(String key) { return (String)extras.get(key); }
  public int getIntExtra(String key,int fallback) { Object v=extras.get(key);return v instanceof Integer?(Integer)v:fallback; }
  @SuppressWarnings("unchecked") public <T extends Parcelable> T getParcelableExtra(String key) { return (T)extras.get(key); }
}
