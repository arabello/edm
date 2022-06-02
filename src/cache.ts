import cache from "flat-cache";
import os from "os";
import path from "path";

const EDM_CACHE_ID = "edm_cache";

export default cache.load(EDM_CACHE_ID, path.resolve(os.tmpdir()));
