import lume from "lume/mod.ts";
import esbuild from "lume/plugins/esbuild.ts";
import sourceMaps from "lume/plugins/source_maps.ts";

import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import typography from "npm:@tailwindcss/typography@0.5.9";

const port = 3000

async function pathAnhilator(request, next) {

    const [prefix, path] = request.url.split(`:${port}`)

    if(path.match("/proteins.*") || path.match("/downloads.*")) {
        const url = new URL(`${prefix}:${port}/`)
        return await next(new Request(url.href, {...request}))
    }
    else {
        return await next(request)
    }
}

const isProduction = Deno.env.get("PRODUCTION") === "True"

const apiHost = () => {

    const hostInEnv = Deno.env.get("openprot_api_host")
    if(hostInEnv) {
        return hostInEnv
    }

    const currentDir = Deno.cwd()

    if(currentDir.startsWith("/openprot-test/")) {
        return "https://api-test.openprot.org"
    }
    return "https://api.openprot.org"
}


const site = lume({
    server: {
        middlewares: [pathAnhilator],
        port
    }
})

site
  .ignore("README.md")
  .ignore("app")
  .use(esbuild({
    extensions: [".jsx"],
    options: {
        jsxDev: ! isProduction,
        minify: isProduction
    }
  }))
  .use(sourceMaps({

  })).use(tailwindcss({
    extensions: [".html", ".jsx"],
    options: {
        plugins: [typography]
    }
  })).use(postcss())
  .copy("img")
;

site.data("static_path_prefix", isProduction ? "/static" : "")
site.data("openprot_api_host", apiHost())

export default site;
