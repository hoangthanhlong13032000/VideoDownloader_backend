const {	pgDB } = require("../../config/database")

const getVideo = async (req, res) => {
	let user_id = req.headers["x-user-id"];
	pgDB.any("SELECT * FROM public.saved_video WHERE user_id=$1", [user_id])
    .then(function (data) {
      res.status(200).send({ status: 0, data, message: "success" });
    })
    .catch(function (error) {
      res
        .status(400)
        .send({
          status: 1,
          data: {},
          message: "Cannot get this video.",
          dev_message: error.toString(),
        });
      console.error(error);
    });
};

module.exports = getVideo;
