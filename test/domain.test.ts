import { either } from "fp-ts";
import { pipe } from "fp-ts/function";
import {
  Path,
  AbsolutePath,
  SpotifyURL,
  SpotPLConfig,
  SpotPLConfigFromYAMLFile,
} from "../src/domain";

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

  describe("AbsolutePath", () => {
    test("should decode only absolute paths", () => {
      const relative = "is/relative";
      const absolute = "/is/absolute";
      expect(pipe(relative, AbsolutePath.decode, either.isLeft)).toBe(true);
      expect(AbsolutePath.decode(absolute)).toStrictEqual(
        either.right(absolute)
      );
    });
  });

  describe("SpotPLConfigFromYAMLFile", () => {
    test("should decode valid configuration file", () => {
      const validConfigFile = `${__dirname}/res/validConfig.yml`;
      expect(SpotPLConfigFromYAMLFile.decode(validConfigFile)).toStrictEqual(
        either.right({
          rootDir: "/tmp/",
          resources: [
            {
              url: "https://open.spotify.com/playlist/6AsSaAUMB8TgbnWu4u3ImP?si=9e2750f388dd466a",
              path: "Techno/Flux",
            },
          ],
        })
      );
    });
    test("should not decode invalid configuration file", () => {
      const invalidConfigFile = `${__dirname}/res/invalidConfig.yml`;
      expect(
        pipe(SpotPLConfigFromYAMLFile.decode(invalidConfigFile), either.isLeft)
      ).toBe(true);
    });
  });
});
