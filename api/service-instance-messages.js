const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const ServiceInstanceMessage = require("../models/service-instance-message");
const ServiceInstance = require("../models/service-instance");

module.exports = function(router) {
  router.post(
    `/service-instance-messages`,
    validate(ServiceInstance),
    auth(null, ServiceInstance),
    async function(req, res, next) {
      const store = require("../config/redux/store");
      // todo:movethiscodeintoaplugin
      const messageManager = store.getState(true).pluginbot.services
        .messageManager[0];
      const serviceInstance = await ServiceInstance.findOne(
        "id",
        req.body.service_instance_id,
      );
      const to =
        serviceInstance.get("user_id") === req.body.user_id
          ? 0
          : serviceInstance.get("user_id");
      const from = req.body.user_id;
      const { message } = req.body;
      const newMessage = await messageManager.send(
        to,
        from,
        req.body.service_instance_id,
        message,
      );
      res.json(newMessage);
    },
  );

  require("./entity")(
    router,
    ServiceInstanceMessage,
    "service-instance-messages",
  );
  return router;
};
