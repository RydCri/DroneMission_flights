import "./js/map.js";
import "./js/missionBuilder.js";
import "./js/tree.js"
import { exportMissionJSON , generateKML, closeBatchEditor, closeWaypointEditor, openBatchEditor} from "./js/tree.js";
import { missions, waypoints, openWaypointEditor} from "./js/missionBuilder.js";

window.exportMissionJSON = exportMissionJSON;
window.closeBatchEditor = closeBatchEditor;
window.openBatchEditor = openBatchEditor;
window.closeWaypointEditor = closeWaypointEditor;
window.openWaypointEditor = openWaypointEditor;
window.generateKML = generateKML;
window.missions = missions;
window.waypoints = waypoints;


