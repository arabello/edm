# Easily Download Music

`edm` helps you to batch download Spotify resources (playlists, album, songs, etc.) into a folders structure. It is a naive wrapper around the wonderful [spotDL](https://github.com/spotDL/spotify-downloader) project.

## Installation

No binaries are available at the moment. You need [git](https://git-scm.com/) and [yarn](https://yarnpkg.com/) installed in your system.

[Install spotDL](https://github.com/spotDL/spotify-downloader#installation).

Clone this repository. Then build and install the package globally:

```shell
git clone git@github.com:arabello/edm.git
cd edm
yarn && yarn build
yarn global add file:$PWD
```

## Usage

The folders structure must be provided via a YAML descriptor: the keys represent folders while values can be any resource supported by [spotDL](https://github.com/spotDL/spotify-downloader).

For example,

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

being the top level folder (`soundvilla`) relative to where you are running `edm`.
For more details, see [YAML descriptor](#yaml-descriptor) section.

Once you created the YAML descriptor, `pull` the resources:

```
edm pull <filename.yaml>
```

### Generate the descriptor

To ease the creation of the YAML descriptor, you can login to your Spotify

```
edm login spotify
```

and generate the YAML descriptor:

```
edm create -f <filename.yaml>
```

This creates a `<filename.yaml>` file containing a flat descriptions of all your
Spotify playlists. At the moment, only playlists you created are supported.

### YAML descriptor

The YAML file specifies a `PullResource` which is recursively defined as:

```plaintext
PullResource = Record<Path, SpotifyURL | NonEmptyArray<SpotifyURL> | PullResource>
```

so each key in the YAML file is a path while the value is a Spotify URL, a list of Spotify URLS or itself.

### Paths

You can specify absolute paths as top-level keys

```yaml
/Users/pelle/Music/:
  Hans Zimmer: ...
```

otherwise paths are relative to the current working directory.

Non top-level keys are interpreted as sub-folders, nested indefinetly. For example

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

As an hobbist DJ, I needed something to ease my `spotDL` user experience in order to download my Spotify's playlists and import them into DJ softwares.

#### But why in Node?

'cause I'm fluent in web technologies and I'd like an Electron GUI in the future.

## Troubleshooting

While running `edm create` you get an error starting with

```
WebapiRegularError: An error occurred while communicating with Spotify's Web API.
Details: The access token expired.
```

you have to login to Spotify again with `edm login spotify`.
