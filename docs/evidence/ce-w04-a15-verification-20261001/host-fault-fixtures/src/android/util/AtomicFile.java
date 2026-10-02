package android.util;
import java.io.*;
import java.nio.file.*;
/** Host filesystem adapter. Does not certify Android AtomicFile crash durability. */
public final class AtomicFile {
  private final File base;
  public AtomicFile(File base) { this.base=base; }
  public File getBaseFile() { return base; }
  public FileInputStream openRead() throws IOException { return new FileInputStream(base); }
  public FileOutputStream startWrite() throws IOException { return new FileOutputStream(base.getPath()+".new"); }
  public void finishWrite(FileOutputStream stream) throws IOException {
    stream.close(); Files.move(Path.of(base.getPath()+".new"),base.toPath(),StandardCopyOption.REPLACE_EXISTING);
  }
  public void failWrite(FileOutputStream stream) throws IOException { stream.close(); Files.deleteIfExists(Path.of(base.getPath()+".new")); }
  public void delete() throws IOException { Files.deleteIfExists(base.toPath());Files.deleteIfExists(Path.of(base.getPath()+".new")); }
}
