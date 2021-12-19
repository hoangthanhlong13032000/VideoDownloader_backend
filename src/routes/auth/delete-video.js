const { pgDB } = require("../../config/database")

const deleteVideo = async (req, res) => {
  let user_id = req.headers["x-user-id"];

  pgDB.none(
    "DELETE FROM public.saved_video WHERE user_id=$1 AND source=$2 AND id=$3",
    [user_id, req.body.source, req.body.id]
  )
    .then(function (data) {
      res.status(200).send({ status: 0, data, message: "success" });
    })
    .catch(function (error) {
      res.status(400).send({
        status: 1,
        data: {},
        message: "Cannot delete this video.",
        dev_message: error.toString(),
      });
    });
};

module.exports = deleteVideo;

