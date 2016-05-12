package ch.heigvd.sea.api;

import ch.heigvd.sea.api.dto.TimeDTO;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * This defines a RESTful endpoint. We only support GET methods
 * @author Olivier Liechti
 */
@RestController
public class ClockController {

    @RequestMapping(path="/clock", method = RequestMethod.GET)
    public TimeDTO clock() {
      return new TimeDTO();
    }
}
