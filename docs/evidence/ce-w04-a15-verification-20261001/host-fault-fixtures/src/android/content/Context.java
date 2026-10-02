package android.content;
import java.io.File;
import android.content.pm.PackageManager;
/** Host-only files-directory adapter. No Android device is connected. */
public class Context {
  private final File directory;
  public Context(File directory) { this.directory = directory; }
  public File getFilesDir() { return directory; }
  public PackageManager getPackageManager() { throw new AssertionError("PackageManager effects outside this fixture"); }
}
