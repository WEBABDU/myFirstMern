const { Router } = require("express");
const Link = require("../models/Links");
const auth = require("../middleware/auth.middleware");
const shorttid = require("shortid")
const config = require("config");
const router = Router();


router.post("/generate", auth, async (req, res) => {
  try {
      const baseUrl = config.get("baseUrl")
      const {from} = req.body
      
      const code = shorttid.generate()

     const existsting =  await Link.findOne({from})
     if(existsting){
         res.json({link: existsting})
     }

     const to = baseUrl + "/t/" + code;
     const link = new Link({
         code, to, from, owner: req.user.userId
     })

     await link.save()

     res.status(201).json({link})


  } catch (e) {
    res.status(500).json({ message: "Some error try again" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
      const links = await Link.find({owner: req.user.userId})
      res.json(links)
  } catch (e) {
    res.status(500).json({ message: "Some error try again" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id)
    res.json(link)
    console.log(req.params.id);
  } catch (e) {
    res.status(500).json({ message: "Some error try again" });
  }
});



module.exports = router;
