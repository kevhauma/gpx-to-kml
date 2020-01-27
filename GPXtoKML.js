let GPX = require('gpx-parse')
let fs = require('fs')

module.exports = convert

async function convert(gpxs) {
    let stringToWrite = getStart()
    for (f of gpxs) {
        stringToWrite += await getKMLString(f)
    }
    return `
        ${stringToWrite}
    </Document>
</kml>`
}

function getKMLString(f) {
    return new Promise((res, rej) => {
        try {
            GPX.parseGpx(f, (error, data) => {
                if (error) throw error
                let date
                let filename
                let trackTimes = []
                let trackPoints = []
                if (!data) throw ("no data found")
                data.tracks.forEach(t => {
                    if(t.name) filename = t.name
                    t.segments.forEach(seg => {
                        seg.forEach(wp => {
                            nwp = {
                                lat: wp.lat,
                                lon: wp.lon,
                                elevation: wp.elevation,
                                time: wp.time
                            }
                            trackTimes.push(nwp.time)
                            trackPoints.push({
                                lat: nwp.lat,
                                lon: nwp.lon,
                                ele: nwp.elevation
                            })
                            date = new Date(nwp.time)
                        })
                    })
                })
                let name = `${getYYYYMMDD(date)} ${filename.replace(".gpx","")}`
                let when = trackTimes.reduce((string, curr) => `${string}
                <when>${curr.toISOString()}</when>`, "")
                let coords = trackPoints.reduce((string, curr) => `${string}
                <gx:coord>${curr.lon} ${curr.lat} ${curr.ele}</gx:coord>`, "")

                let returnString = `
        <Placemark>
            <name>${name}</name>
            <gx:Track>${when}${coords}
            </gx:Track>
        </Placemark>`
                res(returnString)
            })
        } catch (e) {
            console.log(`ERROR`)
            console.log(e)
            res("")
        }
    })
}

function getStart() {
    return '<?xml version="1.0" encoding="UTF-8"?>' + `
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
    <Document>
    <name>imported on ${getYYYYMMDD(new Date())}</name>
	<open>1</open>
    <Style id="multiTrack_h140">
		<IconStyle>
			<color>00ffffff</color>
			<scale>1</scale>
			<Icon>
				<href>http://earth.google.com/images/kml-icons/track-directional/track-0.png</href>
			</Icon>
		</IconStyle>
		<LabelStyle>
			<color>ffffffff</color>
		</LabelStyle>
		<LineStyle>
			<color>99ffac59</color>
			<width>8</width>
		</LineStyle>
	</Style>
	<StyleMap id="multiTrack310">
		<Pair>
			<key>normal</key>
			<styleUrl>#multiTrack_n710</styleUrl>
		</Pair>
		<Pair>
			<key>highlight</key>
			<styleUrl>#multiTrack_h140</styleUrl>
		</Pair>
	</StyleMap>
	<Style id="multiTrack_n710">
		<IconStyle>
			<color>00ffffff</color>
			<Icon>
				<href>http://earth.google.com/images/kml-icons/track-directional/track-0.png</href>
			</Icon>
		</IconStyle>
		<LabelStyle>
			<color>00ffffff</color>
		</LabelStyle>
		<LineStyle>
			<color>99ffac59</color>
			<width>6</width>
		</LineStyle>
	</Style>`
}

function getYYYYMMDD(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}
