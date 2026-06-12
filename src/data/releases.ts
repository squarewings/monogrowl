// Single source of truth for release data, consumed by Releases.astro
// (cards) and Layout.astro (MusicAlbum JSON-LD). See ARCHITECTURE.md.
import type { ImageMetadata } from "astro";
import overflownCover from "../assets/covers/overflown.jpg";
import monogrowlCover from "../assets/covers/monogrowl.jpg";

export interface Track {
  no: string; // "01"
  name: string; // "Overflown"
  len: string; // "04:12" (display)
  iso: string; // "PT4M12S" (schema.org duration)
}

export interface Release {
  title: string;
  cat: string; // "MG/SG/2024 · Single · Self-released"
  year: number; // for MusicAlbum datePublished
  image: ImageMetadata;
  listenUrl: string; // Spotify album URL
  tracks: Track[];
}

export const RELEASES: Release[] = [
  {
    title: "Overflown",
    cat: "MG/SG/2024 · Single · Self-released",
    year: 2024,
    image: overflownCover,
    listenUrl: "https://open.spotify.com/album/2vgmjUCApm3U96bzqMrLVg",
    tracks: [
      { no: "01", name: "Overflown", len: "04:12", iso: "PT4M12S" },
      { no: "02", name: "Overflown (Sub-only)", len: "04:12", iso: "PT4M12S" },
    ],
  },
  {
    title: "Monogrowl",
    cat: "MG/SG/2018 · Single · Debut",
    year: 2018,
    image: monogrowlCover,
    listenUrl: "https://open.spotify.com/album/4I14AwWBSp4KhHPtqqOmKR",
    tracks: [{ no: "01", name: "Monogrowl", len: "03:58", iso: "PT3M58S" }],
  },
];
