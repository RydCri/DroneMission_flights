import "./js/map.js";
import "./js/missionBuilder.js";
import "./js/tree.js"
import { exportMissionJSON , closeBatchEditor, closeWaypointEditor, openBatchEditor} from "./js/tree.js";

window.exportMissionJSON = exportMissionJSON;
window.closeBatchEditor = closeBatchEditor;
window.closeWaypointEditor = closeWaypointEditor;
window.openBatchEditor = openBatchEditor;