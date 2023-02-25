export default class Utils {
    constructor() {}

    // TODO: add yargs
    // https://developer.okta.com/blog/2019/06/18/command-line-app-with-nodejs#add-support-for-command-line-arguments
    getParams = () => {
        let URL;
        let PLAYLIST_URL;
        let FILE_PATH;
        let HELP = false;

        process.argv.forEach((param, index, array) => {
            if (param === "--url" || param === "-u") {
                URL = array[index + 1];
            }

            if (param === "--playlist-url" || param === "-pu") {
                PLAYLIST_URL = array[index + 1];
            }

            if (param === "--file" || param === "-f") {
                FILE_PATH = array[index + 1];
            }

            if (param === "--help" || param === "-h") {
                HELP = true;
            }
        });

        return {
            url: URL,
            playListUrl: PLAYLIST_URL,
            filePath: FILE_PATH,
            help: HELP,
        };
    };

    output = (action, data) => {
        action = action === undefined ? "" : action;
        data = data === undefined ? "" : data;
        //
        console.log(`>>> >>> ${action}: ${data}...`);
    };

    getUrlType = (url, type) => {
        const urlParams = url.split("?")[1];
        const searchParams = new URLSearchParams(urlParams);

        let typeParameter;
        // Display the key/value pairs
        for (const [key, value] of searchParams.entries()) {
            if (key === type) {
                typeParameter = value;
            }
        }

        if (typeParameter === undefined) {
            return {
                status: "error",
                message: "Does haven't it's parameter type: " + type,
            };
        }

        if (type === "v") {
            return {
                status: "success",
                message: "https://www.youtube.com/watch?v=" + typeParameter,
            };
        }

        if (type === "list") {
            return {
                status: "success",
                message:
                    "https://www.youtube.com/playlist?list=" + typeParameter,
            };
        }

        return {
            status: "error",
            message: "Unknow error.",
        };
    };
}
