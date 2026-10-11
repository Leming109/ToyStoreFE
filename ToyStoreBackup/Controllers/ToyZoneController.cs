using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ToyStoreBackup.Controllers
{
    public class ToyZoneController : Controller
    {
        // GET: ToyZone
        public ActionResult HomeView()
        {
            return View();
        }

        public ActionResult Cart()
        {
            return View();
        }
        public ActionResult user()
        {
            return View();
        }
    }
}