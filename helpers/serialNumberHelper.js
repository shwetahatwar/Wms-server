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

exports.getSerialNumbers = (materialInwardDetial) => {
  var { partNumberId, batchNumber, quantity, shelfId, eachPackQuantity, invoiceReferenceNumber, siteId, inwardDate, partNumber } = materialInwardDetial;

  if (!partNumber) {
    partNumber = req.partNumber["partNumber"]
  }

  if (!req.materialInward) {
    serialNumberId ="1111111111";
  }
  else {
    serialNumberId = req.materialInward["barcodeSerial"];
  }
  var materialInward = [];

  for (var i = 0; i < parseInt(quantity); i++) {
    serialNumberId = (parseInt(serialNumberId) + 1).toString();
    serialNumberId = '' + serialNumberId;
    console.log("serialNumberId",serialNumberId)

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
      createdBy:req.user.username,
      updatedBy:req.user.username
    }
  }

  return materialInward;
}