const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.movieAuditLogger = functions.firestore
    .document("movies/{movieId}")
    .onWrite(async (change, context) => {
      const movieId = context.params.movieId;

      const beforeData = change.before.exists ?
        change.before.data() :
        null;

      const movieData = change.after.exists ?
        change.after.data() :
        null;

      let actionType = "MOVIE_UPDATED";

      if (!change.before.exists && change.after.exists) {
        actionType = "MOVIE_CREATED";
      } else if (change.before.exists && !change.after.exists) {
        actionType = "MOVIE_DELETED";
      } else if (
        beforeData &&
        beforeData.featured !== true &&
        movieData.featured === true
      ) {
        actionType = "FEATURED_BANNER_ENABLED";
      } else if (
        beforeData &&
        beforeData.featured === true &&
        movieData.featured !== true
      ) {
        actionType = "FEATURED_BANNER_REMOVED";
      }

      await db
          .collection("adminData")
          .doc("securityLogs")
          .collection("events")
          .add({
            actionType: actionType,
            movieId: movieId,
            movieTitle: (movieData && movieData.title) ||
    (beforeData && beforeData.title) ||
    "Unknown Movie",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            serverless: true,
            source: "Firebase Cloud Function",
          });

      console.log("Audit log created:", actionType);

      return null;
    });

