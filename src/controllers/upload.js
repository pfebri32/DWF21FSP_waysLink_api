exports.uploadImage = async (req, res) => {
  try {
    // Initials.
    const { files } = req;

    if (!files?.img[0]) {
      return res.status(422).send({
        status: 'invalid',
        message: 'You need to pick image to use.',
      });
    }

    res.send({
      status: 'success',
      message: 'Upload image is successs.',
      data: {
        img: process.env.UPLOADS_URL + files.img[0].filename,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: 'Oops, something error!',
    });
  }
};
