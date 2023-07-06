import { Helper } from "lume/core.ts";

interface Helpers {
  [key: string]: Helper;
}

export default function (_data: unknown, { url }: Helpers) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script
      src="https://unpkg.com/react@17/umd/react.production.min.js"
      crossorigin
    ></script>
    <script
      src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"
      crossorigin
    ></script>
    <script
      src="https://unpkg.com/@jbrowse/react-linear-genome-view/dist/react-linear-genome-view.umd.production.min.js"
      crossorigin
    ></script>
  </head>

  <body>
    <div id="jbrowse_linear_genome_view"></div>    
    <script type="module" src="${_data.static_path_prefix}${url("/jbrowse.js")}" bundle></script>
  </body>
</html>`
}
