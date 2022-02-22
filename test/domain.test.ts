import { either } from "fp-ts";
import { pipe } from "fp-ts/function";
import { Path, SpotifyURL, SpotPLConfig } from "../src/domain";

describe("domain", () => {
  describe("SpotifyURL", () => {
    test("should decode correct Spotify URLs", () => {
      const spotifyURL = "https://open.spotify.com/test";
      expect(SpotifyURL.decode(spotifyURL)).toStrictEqual(
        either.right(spotifyURL)
      );
    });
    test("should not decode any other URLs", () => {
      const nonSpotifyURL = "https://ope.spotify.com/test";
      expect(either.isLeft(SpotifyURL.decode(nonSpotifyURL))).toBe(true);
    });
  });

  describe("Path", () => {
    test("should decode correct directory paths", () => {
      const relative = "relative/path";
      expect(Path.decode(relative)).toStrictEqual(either.right(relative));

      const absolute = "/absolute/path";
      expect(Path.decode(absolute)).toStrictEqual(either.right(absolute));
    });

    test("should not decode non directory paths", () => {
      const file = "this/is/a/file.html";
      expect(pipe(Path.decode(file), either.isLeft)).toBe(true);

      const fileAbsolute = "/this/is/a/file.html";
      expect(pipe(Path.decode(fileAbsolute), either.isLeft)).toBe(true);
    });
  });
});
