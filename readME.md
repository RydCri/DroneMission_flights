### WIP

<h3>DroneMission Component: Mission Builder</h3>
<br>
This repository tracks the development of a component for integration into the DroneMission project.
<br>
https://github.com/RydCri/DroneMission/
<br>
<img style="height:400px;width:300px;" src="flightDemo.gif" alt="demo screen shot">
<br>
<i>Flight Mission Demo</i>
<br>
<br>
This app provides users of the webapp with tools to:
<br>

<ul>
<li>Build flightpath waylines around points of interest.</li>
<li>Customize for use-case (alt adjustments, image overlay).</li>
<li>Export flight as .kmz file for easy integration into compatible FCS.</li>
<li>Turn collected flight photos into usable projects.</li>
</ul>
<br>
This app's focus is on generating maps, orthomosaics, and photogrammetry using FPV and gimbal camera drones.
<br>
<p>The app is intended for use with off-the-shelf dronekits that support mission planning through tools like DJI Pilot, QGroundControl, or Mission Planner.</p>
<img style="height:200px;width:250px;" src="./readmeScreens/orbitsTrees.png" alt="project select">
<div>
<p>Build a mission and export as a .kml file, a popular format for pre-planned drone flight missions.</p>
<img style="height:200px;width:250px;" src="./readmeScreens/kmlxml.png" alt="project select">
<br>

<br>
<i>A single grid flight can collect photos usable for projects in basic photogrammetry like Digital Surface Models (DSM) or Digital Elevation Models (DEM)</i>
</div>
<img style="height:200px;width:250px;" src="./readmeScreens/kmlEdit.png" alt="project select">


### Gimbal camera settings

<p>Using the default camera setting will set the camera gimbal at an angle to keep the point of interest in frame during the flightpath</p>
<p>This angle is reckoned based off the distance of the waypoint from POI, altitude of drone and altitude of POI. <i>default 1 meter</i></p>
<img style="height:200px;width:250px;" src="/readmeScreens/tilt_vs_altitude.png" alt="gimbal angle chart">
<br>
<h3>Important:</h3>
<p>Flight .kml(s) are not dynamic and high speed can throw POI off frame between waypoints.</p>
<p>Recommended you assume 2.5 m/s as your 'safe' speed for photogrammetry.</p>
<img style="height:200px;width:250px;" src="readmeScreens/drone_cam_tilt.png" alt="drone tilt angle chart">
<br>
<p>Your drone's ability to keep a POI in frame is based off its own camera stabilization tools or a mission executor that takes your drone's IMU to compensate drone pitch with gimbal pitch.</p>

| Drone Type                            | Safe Orbit Speed | Notes                                      | 
|---------------------------------------|------------------|--------------------------------------------|
| Cine drones (DJI Mavic, Air, Phantom) | 1.5 – 4 m/s      | Smooth gimbal, good stabilization          |
| FPV drones (fixed camera)             | 1 – 2 m/s        | Must go slower; camera can't compensate    |
| Cinematic Look (Slow orbit)           | 0.5 – 1.5 m/s    | Best for interviews, real estate           |
| Fast tracking (Dynamic action)        | 4 – 6 m/s        | Requires 60fps+ capture, high gimbal skill |