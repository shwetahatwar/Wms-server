
exports.generateSerialNumber =async (shelfData,rackId,zoneId,siteId,vertical)=>{
  let serialNumber;
  if(shelfData){
    serialNumber = shelfData["barcodeSerial"];
    zoneId = shelfData["rack"]["zoneId"];
    siteId = shelfData["rack"]["zone"]["siteId"];
    serialNumber = serialNumber.substring(10,13);
    serialNumber = (parseInt(serialNumber) + 1).toString();
    var str = serialNumber;
    if(str.length == 1) {
      str = '00' + str;
    }
    else if(str.length == 2) {
      str = '0' + str;
    }

    if(siteId.toString().length < 2) {
      serialNumber = '0' + siteId;
    }
    else{
      serialNumber = siteId;
    }
    if(zoneId.toString().length < 2) {
      serialNumber = serialNumber + "-" + '0' + zoneId;
    }
    else{
      serialNumber = serialNumber + "-" + zoneId;
    }
    if(rackId.toString().length == 1) {
      serialNumber = serialNumber + "-" + '00' + rackId;
    }
    else if(rackId.toString().length == 2) {
      serialNumber = serialNumber + "-" +'0' + rackId;
    }
    else{
      serialNumber = serialNumber + "-" + rackId;
    }
    serialNumber = serialNumber + "-" + str + "-" + vertical;
  }
  else{
    if(!zoneId || !siteId){
      var rackData = await Rack.findOne({
        where: { 
          id: rackId,
        },
        include: [{
          model: Zone
        }],
      });

      if(!rackData){
        return next(HTTPError(500, "Shelf not created,invalid rack"))
      }

      if(rackData){
        rackData = rackData.toJSON();
        zoneId = rackData["zoneId"];
        siteId = rackData["zone"]["siteId"]
      }
    }

    if(siteId.toString().length < 2) {
      serialNumber = '0' + siteId;
    }
    else{
      serialNumber = siteId;
    }
    if(zoneId.toString().length < 2) {
      serialNumber = serialNumber + "-" + '0' + zoneId;
    }
    else{
      serialNumber = serialNumber + "-" + zoneId;
    }
    if(rackId.toString().length == 1) {
      serialNumber = serialNumber + "-" + '00' + rackId;
    }
    else if(rackId.toString().length == 2) {
      serialNumber =serialNumber +"-" +  '0' + rackId;
    }
    else{
      serialNumber = serialNumber + "-" + rackId;
    }
    serialNumber = serialNumber + "-" + "001" + "-" + vertical;
  }
  return serialNumber
};