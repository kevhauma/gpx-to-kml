let convert = require('./GPXtoKML')
let fs = require('fs')



fs.readdir("./gpx/", async (err, files) => {
    let gpxs = []
    files.filter(f => f.endsWith(".gpx"))
         .forEach(f=>{
        console.log("converting: " + f)
                let gpxString = fs.readFileSync(`./gpx/${f}`)
                gpxs.push(gpxString)
        })
    write(await convert(gpxs))
})



function write(string){
    if (!fs.existsSync("./kml")){
    fs.mkdirSync("./kml");
}
    
    let file = `./kml/${getYYYYMMDD(new Date())}-${Date.now()}.kml`
    
    fs.writeFile(file ,string.trim(),(err,data)=>{
        if(err) console.log(err)
        console.log("Written to " + file)
        console.log(string.charAt(0))
    })
}




function getYYYYMMDD(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}