import { array, either } from "fp-ts";
import { pipe } from "fp-ts/function";
import { Path, SpotifyURL, PullResourceFromYAML } from "../src/domain";

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

  describe("PullResourceFromYAML", () => {
    test("should decode valid configuration", () => {
      const yaml = `
      /top/level/path:
        folder:
          subfolder: https://open.spotify.com/top/level/path/folder/subfolder
        folder2:
          - https://open.spotify.com/top/level/path/folder2/subfolderA
          - https://open.spotify.com/top/level/path/folder2/subfolderB
      /another/top/level:
        folder:
          subfolder:
            nested: https://open.spotify.com//another/top/level/folder/subfolder/nested
      `;
      const js = {
        "/top/level/path": {
          folder: {
            subfolder:
              "https://open.spotify.com/top/level/path/folder/subfolder",
          },
          folder2: [
            "https://open.spotify.com/top/level/path/folder2/subfolderA",
            "https://open.spotify.com/top/level/path/folder2/subfolderB",
          ],
        },
        "/another/top/level": {
          folder: {
            subfolder: {
              nested:
                "https://open.spotify.com//another/top/level/folder/subfolder/nested",
            },
          },
        },
      };
      expect(PullResourceFromYAML.decode(yaml)).toStrictEqual(either.right(js));
    });

    test("should not decode invalid configuration file", () => {
      const yamls = [
        "https://open.spotify.com/top/level/path/folder/subfolder: /top/level/path",
        "/top/level/path: https://google.com",
      ];

      pipe(
        yamls,
        array.map(PullResourceFromYAML.decode),
        array.map(either.isLeft),
        array.map((x) => expect(x).toBe(true))
      );
    });
  });
});
