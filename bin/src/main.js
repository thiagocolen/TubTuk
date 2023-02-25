import fs from "fs";
import ytdl from "ytdl-core";
import Utils from "./utils.js";
import UrlHandler from "./url-handler.js";

const utils = new Utils();
const urlHandler = new UrlHandler();

export default class Main {
    constructor() {}
    getHelp = () => {
        console.log("\n");
        console.log("-------------------------------------- TubTuk.js Help \n");
        console.log(
            "--url || -u [VIDEO-URL]                to download from a video URL"
        );
        console.log(
            "--playlist-url || -pu [PLAYLIST-URL]   to download from a playlist URL"
        );
        console.log(
            "--file || -f [FILE-PATH]               to download from a file with a list (one per line) of playlist URL"
        );
        console.log(
            '                                       lines start with "#" will be ignored'
        );
        console.log("--help || -h                           to get help \n");
        console.log("--------------------------------------");
    };

    downloadVideo = async (videoUrl) => {
        const videoInfo = await ytdl.getInfo(videoUrl);
        const videoTitle = videoInfo.videoDetails.title;

        const videoTitleSanitized = videoTitle
            .replace("/", "-")
            .replace(":", "-");

        const videoFormat = ytdl.chooseFormat(videoInfo.formats, {
            quality: "highestaudio",
        });
        const videoStream = ytdl(videoUrl, { format: videoFormat });

        const videoWriteStream = fs.createWriteStream(
            `./output/${videoTitleSanitized}.mp4`
        );
        videoStream.pipe(videoWriteStream);

        return new Promise((resolve, reject) => {
            videoWriteStream.on("finish", () => {
                utils.output(`Video saved to ${videoTitleSanitized}.mp4`);
                resolve();
            });

            videoWriteStream.on("error", (error) => {
                utils.output(`Error saving video: ${error.message}`);
                reject(error);
            });
        });
    };

    processPromises = async (videoUrlList) => {
        try {
            for (const element of videoUrlList) {
                await this.downloadVideo(element);
            }
        } catch (error) {
            utils.output(error);
        }
    };

    init = async () => {
        const params = utils.getParams();

        let hrefList = [];

        if (params.help === true) {
            this.getHelp();
            return;
        }

        if (params.url !== undefined) {
            hrefList = [params.url];

            let playlistUrlFormatted = utils.getUrlType(params.url, "v");
            if (playlistUrlFormatted.status === "error") {
                return playlistUrlFormatted.message;
            }

            if (playlistUrlFormatted.status === "success") {
                hrefList = [playlistUrlFormatted.message];
            }
        }

        // TODO: playlistUrlFormatted is duplicated, let's fix it

        if (params.playListUrl !== undefined) {
            let playlistUrlFormatted = utils.getUrlType(
                params.playListUrl,
                "list"
            );
            if (playlistUrlFormatted.status === "error") {
                return playlistUrlFormatted.message;
            }

            if (playlistUrlFormatted.status === "success") {
                hrefList = await urlHandler.myGetPlaylistURLs(
                    playlistUrlFormatted.message
                );
            }
        }

        // TODO: I want to get a playlist URL, get all links and download them
        // so, just after this, I will get the next playlist URL from file
        if (params.filePath !== undefined) {
            let playlistLinks = await urlHandler.myGetPlaylistLinksFromFile(
                params.filePath
            );
            //
            for (let playlistUrl of playlistLinks) {
                let playlistUrlFormatted = utils.getUrlType(
                    playlistUrl,
                    "list"
                );

                if (playlistUrlFormatted.status === "error") {
                    return playlistUrlFormatted.message;
                }

                if (playlistUrlFormatted.status === "success") {
                    let list = await urlHandler.myGetPlaylistURLs(
                        playlistUrlFormatted.message
                    );
                    hrefList = hrefList.concat(list);
                }
            }
        }

        if (
            params.help === false &&
            params.url === undefined &&
            params.playListUrl === undefined &&
            params.filePath === undefined
        ) {
            this.getHelp();
            return;
        }

        utils.output("Videos to download:", hrefList.length);

        this.processPromises(hrefList);
    };
}
