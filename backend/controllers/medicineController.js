const Medicine = require("../models/Medicine");
const csv = require("csv-parser");
const fs = require("fs");

exports.addMedicine = async (req,res)=>{
  try{
    const {name,category,price,stock,description} = req.body;
    let image = "";
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const medicine = new Medicine({
      name,
      category,
      price,
      stock,
      description,
      image
    });

    await medicine.save();
    res.json(medicine);
  }catch(err){
    res.status(500).json(err);
  }
};

exports.bulkUploadMedicines = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a CSV file" });
  }

  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv({ mapHeaders: ({ header }) => header.replace(/^\\uFEFF/, '').trim().toLowerCase() }))
    .on('data', (data) => {
      // Debug: Console log the first mapping
      if (results.length === 0) { console.log('FIRST IMPORT ROW:', data); }
      
      // Validate row (now we know keys are lowercase and trimmed, without excel BOM)
      if (data.name && data.price && data.stock) {
        results.push({
          name: data.name.trim(),
          category: data.category ? data.category.trim() : "Uncategorized",
          price: Number(data.price) || 0,
          stock: Number(data.stock) || 0,
          description: data.description ? data.description.trim() : "",
          image: data.image ? data.image.trim() : ""
        });
      } else if (data.name) {
         // Fallback if price or stock header names slightly varied in Excel
         results.push({
          name: data.name.trim(),
          category: data.category ? data.category.trim() : "Uncategorized",
          price: Number(data.price || data.mrp || data.cost || 0),
          stock: Number(data.stock || data.quantity || data.qty || 10),
          description: data.description ? data.description.trim() : "",
          image: data.image ? data.image.trim() : ""
        });
      }
    })
    .on('end', async () => {
      try {
        let addedOrUpdatedCount = 0;

        for (const item of results) {
          // Update existing or add new
          await Medicine.findOneAndUpdate(
            { name: item.name },
            { $set: item },
            { upsert: true, new: true }
          );
          addedOrUpdatedCount++;
        }

        // Clean up the uploaded file
        fs.unlinkSync(filePath);

        res.json({
          message: "Bulk upload completed",
          added: addedOrUpdatedCount,
          skipped: 0,
          totalProcessed: results.length
        });
      } catch (err) {
        fs.unlinkSync(filePath);
        res.status(500).json({ message: "Error saving to database", error: err.message });
      }
    });
};

exports.getMedicines = async (req,res)=>{
  try{
    const medicines = await Medicine.find().sort({createdAt:-1});
    res.json(medicines);
  }catch(err){
    res.status(500).json(err);
  }
};

exports.deleteMedicine = async (req,res)=>{
  try{
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({message:"Medicine deleted"});
  }catch(err){
    res.status(500).json(err);
  }
};
