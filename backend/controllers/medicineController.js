const Medicine = require("../models/Medicine");

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
