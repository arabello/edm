import { PullResource } from "../src/domain";
import { flatten, FlattenPullResource } from "../src/resource";

describe("resource", () => {
  describe("flatten", () => {
    test("should flat a PullResource", () => {
      const pullResource: PullResource = {
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
                "https://open.spotify.com/another/top/level/folder/subfolder/nested",
            },
          },
        },
      };

      const flattened: FlattenPullResource = [
        {
          path: "/top/level/path/folder/subfolder",
          urls: ["https://open.spotify.com/top/level/path/folder/subfolder"],
        },
        {
          path: "/top/level/path/folder2",
          urls: [
            "https://open.spotify.com/top/level/path/folder2/subfolderA",
            "https://open.spotify.com/top/level/path/folder2/subfolderB",
          ],
        },
        {
          path: "/another/top/level/folder/subfolder/nested",
          urls: [
            "https://open.spotify.com/another/top/level/folder/subfolder/nested",
          ],
        },
      ];

      expect(flatten(pullResource)).toStrictEqual(flattened);
    });
  });
});
