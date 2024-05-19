const Operation = require('../model/Operation');

const OperationContoller = {
    getAllOperations: async (req, res) => {
        try {
            const operations = await Operation.find().populate([
                {
                    path: 'dailyPass_id',
                    model: 'DailyPass',
                    populate: [
                        {
                            path: 'patient_id',
                            model: 'User',
                            select: '-password'
                        },
                        {
                            path: 'association_id',
                            model: 'Association',
                        },
                    ]
                },
            ]);
            return res.json({ operations: operations });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: " Server Error" });
        }
    },
    deleteOperation: async (req, res) => {
        try {
            const { operation_id } = req.params
            const operation = await Operation.findByIdAndDelete(operation_id);
            if(!operation){
                return res.json({ message: 'Operation not found!' });
            }
            return res.json({ message: 'success' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: " Server Error" });
        }
    },
};

module.exports = OperationContoller