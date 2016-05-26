package ch.heigvd.sea.domain.repositories;

import ch.heigvd.sea.domain.entities.Beer;
import java.util.List;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 *
 * @author Olivier Liechti (olivier.liechti@heig-vd.ch)
 */
@RepositoryRestResource(collectionResourceRel = "beers", path = "beers")
public interface BeerRepository extends PagingAndSortingRepository<Beer, Long> {

  List<Beer> findByName(@Param("name") String name);

}
