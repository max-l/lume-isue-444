import { Helper } from "lume/core.ts";

interface Helpers {
  [key: string]: Helper;
}

export default function (_data: unknown, { url }: Helpers) {
  return `<!doctype html>
	<html>
		<head>
			<meta charset="utf-8">					
			<link rel="stylesheet" href="${_data.static_path_prefix}${url("/styles.css")}">			    			
		</head>
		<body>
			<div id="app"/>
			<script>var openprot_api_host = "${_data.openprot_api_host}"</script>
						
			<script type="module" src="${_data.static_path_prefix}${url("/main.js")}" bundle></script>
            <script src="https://3Dmol.org/build/3Dmol-min.js"></script>
            <script src="https://3Dmol.org/build/3Dmol.ui-min.js"></script>					
		</body>		
	</html>
	`
}
