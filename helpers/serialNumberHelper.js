// exports.getSerialNumbers = (req, res, next) => {
//   var { partNumberId, batchNumber, quantity, shelfId, eachPackQuantity, invoiceReferenceNumber, siteId, inwardDate } = req.body;

//   var materialInward = [];
//   var serialNumberId;

//   if (!req.materialInward) {
//     serialNumberId ="1111111111";
//   }
//   else {
//     serialNumberId = req.materialInward["barcodeSerial"];
//   }

//   for (var i = 0; i < parseInt(quantity); i++) {
//     serialNumberId = (parseInt(serialNumberId) + 1).toString();
//     serialNumberId = '' + serialNumberId;
//     console.log("serialNumberId",serialNumberId)

//     materialInward[i] = {
//       partNumberId: partNumberId,
//       shelfId: shelfId,
//       batchNumber: batchNumber,
//       barcodeSerial: serialNumberId,
//       partNumber:req.partNumber["partNumber"],
//       eachPackQuantity: eachPackQuantity,
//       invoiceReferenceNumber: invoiceReferenceNumber,
//       inwardDate: inwardDate,
//       QCStatus: 0,
//       status:true,        
//       QCRemarks: "NA",
//       siteId :siteId,
//       materialStatus : "NA",
//       createdBy:req.user.username,
//       updatedBy:req.user.username
//     }
//   }

//   req.materialInwardList = materialInward;
//   next();
// };

exports.getSerialNumbers = (materialInwardDetail,partNumber,reqMaterialInward,username) => {
  var { partNumberId, batchNumber, quantity, shelfId, eachPackQuantity, invoiceReferenceNumber, siteId, inwardDate} = materialInwardDetail;
  console.log("materialInwardDetail",materialInwardDetail)
  if (!reqMaterialInward) {
    serialNumberId ="1111111111";
  }
  else {
    serialNumberId = reqMaterialInward["barcodeSerial"];
  }
  var materialInward = [];
  console.log("IN line 52",quantity);
  for (var i = 0; i < parseInt(quantity); i++) {
    serialNumberId = (parseInt(serialNumberId) + 1).toString();
    serialNumberId = '' + serialNumberId;
    console.log("serialNumberId",serialNumberId)
    if(!inwardDate){
      inwardDate = Date.now();
    }
    materialInward[i] = {
      partNumberId: partNumberId,
      shelfId: shelfId,
      batchNumber: batchNumber,
      barcodeSerial: serialNumberId,
      partNumber: partNumber,
      eachPackQuantity: eachPackQuantity,
      invoiceReferenceNumber: invoiceReferenceNumber,
      inwardDate: inwardDate,
      QCStatus: 0,
      status:true,        
      QCRemarks: "NA",
      siteId :siteId,
      materialStatus : "NA",
      createdBy:username,
      updatedBy:username
    }
  }

  return materialInward;
}