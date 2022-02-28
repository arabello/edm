# SpotPL

Extremely naive wrapper around [spotDL](https://github.com/spotDL/spotify-downloader)
to download Spotify songs organized by folders based on a YAML config.

## Usage

```shell
Usage: spotpl [options] <file>

Download Spotify songs in a organized way

Arguments:
  file                       YAML file to be processed

Options:
  -V, --version              output the version number
  -nt, --n-threads <number>  Number of threads used by spotDL (default: 4)
  -h, --help                 display help for command
```

For example. The YAML file

```yaml
soundvilla:
  techno:
    Vibration: https://open.spotify.com/playlist/62CIVxzifVE0DJWVzqOej2?si=35e1e60d854d4ffe
    Void: https://open.spotify.com/playlist/3WdQghJJDS9ZTYkukRmDnB?si=81ba1e30d5804bfe
  tech house:
    Golden Hour: https://open.spotify.com/playlist/3S6lYfZsQie1CKQFCSDONL?si=6cc6e42c8c7b4ea4
  Kalkbrenner:
    - https://open.spotify.com/track/4IsHMzDbRE8q5Z4ALsQj3o?si=2aecbba690c14bd6
    - https://open.spotify.com/track/2xUsXYIiK18wSnv2SXFGtj?si=e0777c746315405b
```

would download the specified Spotify resources with the following folder structure:

```
soundvilla
├── Kalkbrenner
│   ├── NTO, Paul Kalkbrenner - Invisible - Paul Kalkbrenner Remix.mp3
│   └── Paul Kalkbrenner, Fritz Kalkbrenner - Sky and Sand.mp3
├── tech house
│   └── Golden Hour
└── techno
    ├── Vibration
    └── Void

```

### YAML file structure

The YAML file specifies a `PullResource` which is recursively defined as:

```plaintext
PullResource = Record<Path, SpotifyURL | NonEmptyArray<SpotifyURL> | PullResource>
```

so each key in the YAML file is a path and the value is a Spotify URL, a list of Spotify URLS or itself.

### Paths

You can specifiy absolute paths as top-level keys:

```yaml
/Users/pelle/Music/:
  Hans Zimmer: ...
```

otherwise paths are relative to the current working directory.

Non top-level keys are interpreted as sub-folders, nested indefinetly.
For example:

```yaml
very:
  long:
    path:
      to:
        reach:
          this:
            awesome:
              playlist: https://open.spotify.com/playlist/5KWtj52ZN9GCaGmU8qncrw?si=8512d53fa4084d72
```

is resolved to `./very/long/path/to/reach/this/awesome/playlist/`

### Spotify URLs

You can specify a single or a list of Spotify URLs.

```yaml
Rock It:
  Sum 41:
    - https://open.spotify.com/track/1ibeKVCiXORhvUpMmtsQWq?si=e5f9599a39424426
    - https://open.spotify.com/track/1ibeKVCiXORhvUpMmtsQWq?si=e5f9599a39424426
  blink-182: https://open.spotify.com/track/4LJhJ6DQS7NwE7UKtvcM52?si=b0ed7ce319804e13
```

`spotPL` directly invokes `spotDL`, so you can use any URL that it [supports](https://github.com/spotDL/spotify-downloader#usage).

## Why?

I needed something to ease my `spotDL` user experience to "sync" my Spotify's playlists offline, in a organized way.

#### But why in Node?

'cause I'm fluent in web technologies and I'd like an Electron GUI in the future.
