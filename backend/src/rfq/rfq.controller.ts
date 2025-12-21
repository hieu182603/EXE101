import { Service } from "typedi";
import { RFQService } from "./rfq.service";
import { Controller, Post, Body } from "routing-controllers";
import { BuildFilterDTO } from "./dto/BuildFilter.dto";

@Service()
@Controller("/request-for-quota")
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  @Post("/builds")
  async getBuilds(@Body() filter: BuildFilterDTO) {
    return this.rfqService.getBuilds(filter); // returns { builds, count }
  }

  //   @Post("/run-buildmaker")
  //   async runBuildmaker() {
  //     return this.rfqService.rfqProcess(Number.MAX_SAFE_INTEGER);
  //   }
}
