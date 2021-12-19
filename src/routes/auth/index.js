const router = require("express").Router();
const saveVideo = require("./save-video");
const getVideo = require("./get-video");
const deleteVideo = require("./delete-video")

// middleware: parse Authorization header and set user_id to x-user-id header
router.use(function (req, res, next) {
  try {
    let buff = new Buffer.from(
      req.headers.authorization.split(".")[1],
      "base64"
    );
    const { sub } = JSON.parse(buff.toString("ascii"));
    req.headers["x-user-id"] = sub;
		next();
  } catch (err) {
    res.status(400).send({
      status: 1,
      data: {},
      message: "Cannot parse authorization header!",
    });
    console.error(err);
  }
});

// define routes
router.route("/video").post(saveVideo);
router.route("/video").get(getVideo);
router.route("/video").delete(deleteVideo);

module.exports = router;
