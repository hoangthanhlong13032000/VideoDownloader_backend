const { pgDB } = require("../../config/database")

const saveVideo = async (req, res) => {
  let user_id = req.headers["x-user-id"];

  pgDB.none(
    "INSERT INTO public.saved_video (user_id, source, id, title, description, thumbnail) VALUES ($1, $2, $3, $4, $5, $6)",
    [
      user_id,
      req.body.source,
      req.body.id,
      req.body.title,
      req.body.description,
      req.body.thumbnail,
    ]
  )
    .then(function (data) {
      res.status(200).send({ status: 0, data: {}, message: "success" });
    })
    .catch(function (error) {
      res
        .status(400)
        .send({
          status: 1,
          data: {},
          message: "Cannot save this video.",
          dev_message: error.toString(),
        });
    });
};

module.exports = saveVideo;
