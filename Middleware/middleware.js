const jwt = require('jsonwebtoken');


const verifyAdminGlobal = (req, res, next) => {
  if (req.user.role !== 'adminGlobal') {
      return res.status(403).json({ message: 'Forbidden!' })
  }
  next()
}

//
const verifyAdmin = (req, res, next) => {
    if ((req.user.role !== 'admin') && (req.user.role !== 'adminGlobal')) {
        return res.status(403).json({ message: 'Forbidden!' })
    }
    next()
}

const verifyResponsable = (req, res, next) => {
    if ((req.user.role !== 'responsable') && (req.user.role !== 'adminGlobal')&&(req.user.role !== 'admin')) {
        return res.status(403).json({ message: 'Forbidden!' })
    }
    next()
}



// Middleware de vérification du token(howa middleware li 3malta zay filter taw kif n7otta fi blasa may5alich luser yet3ada kif ywali ma3ndech token)
const verifyToken = (req, res, next) => {
    try {
        // Récupérer le token depuis les en-têtes de la requête
        const token = req.header('Authorization')?.split(' ')[1];
        // Vérifier si le token est présent
        if (!token) {
            return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
        }

        // Vérifier le token à l'aide de la clé secrète
        const decoded = jwt.verify(token, 'your-secret-key');
        // Ajouter les données du token à l'objet de requête pour une utilisation ultérieure si nécessaire
        req.user = decoded;
        // Passer à l'étape suivante du middleware
        next();
    } catch (error) {
        // En cas d'erreur de vérification du token
        console.error('Erreur de vérification du token:', error);
        return res.status(401).json({ message: 'Accès non autorisé. Token non valide.' });
    }
};

module.exports = { verifyToken, verifyAdmin ,verifyAdminGlobal,verifyResponsable};