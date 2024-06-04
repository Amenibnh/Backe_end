const Site = require("../model/Site");
const Association = require("../model/association");

const siteController = {
  addSite: async (req, res) => {
    try {
      const { associationId, url } = req.body;

      // Vérifier si l'association existe
      const association = await Association.findById(associationId);
      if (!association) {
        return res.status(404).json({ message: 'Association not found' });
      }

      // Générer un sous-domaine unique pour l'association
      const subdomain = `${association.ville.toLowerCase().replace(/\s+/g, '')}.localhost`;
  
      // Créer un nouveau site avec le sous-domaine généré
      const newSite = new Site({
        association_id: associationId,
        url: subdomain
      });

      const savedSite = await newSite.save();

      // Mettre à jour l'association avec le nouvel identifiant de site
      association.url = savedSite._id;
      await association.save();

      res.status(201).json(savedSite);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getAllSites: async (req, res) => {
    try {
      const sites = await Site.find().populate('association_id');
      res.status(200).json(sites);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  updateSite: async (req, res) => {
    try {
      const updatedSite = await Site.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      }, { new: true });

      res.status(200).json(updatedSite);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  deleteSite: async (req, res) => {
    try {
      await Site.findByIdAndDelete(req.params.id);
      res.status(200).json("Site has been deleted");
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = siteController;
