package ch.heigvd.sea.api.dto;

import java.util.Date;

/**
 * This class is a Data Transfer Object (DTO) for our clock RESTful endpoint. Notice
 * that it defines immutable objects (there is a getter but no setter). This DTO
 * will be automatically serialized to JSON by the underlying framwork.
 * 
 * @author Olivier Liechti
 */
public class TimeDTO {

  private final Date date;

  public TimeDTO() {
    date = new Date();
  }

  public Date getDate() {
    return date;
  }
  
}
