import { Body, BodyParam, Controller, Get, Post } from "routing-controllers";
import { Service } from "typedi";
import { OtpService } from "./otp.service";
import { ValidationException } from "@/exceptions/http-exceptions";
import { IsString, IsOptional, Length, Matches } from "class-validator";

class SendOtpDto {
    @IsString()
    identifier: string;

    @IsOptional()
    @IsString()
    username?: string;
}

class VerifyOtpDto {
    @IsString()
    identifier: string;

    @IsString()
    @Length(6, 6)
    @Matches(/^\d+$/)
    otp: string;
}

@Service()
@Controller("/otp")
export class OtpController {
    constructor(private readonly otpService: OtpService) {}

    @Get("/active")
    async getActiveOtp() {
        const result = await this.otpService.getActiveOtp();
        return {
            success: true,
            data: result,
        };
    }

    @Post("/send")
    async sendOtp(@Body() body: SendOtpDto) {
        const result = await this.otpService.sendOtp(body.identifier, body.username);
        return {
            success: true,
            message: "OTP sent successfully",
            data: result,
        };
    }

    @Post("/verify")
    async verifyOtp(@Body() body: VerifyOtpDto) {
        const verify = await this.otpService.verifyOtp(body.identifier, body.otp);
        if(!verify) throw new ValidationException("OTP is wrong or is expired");
        return {
            success: true,
            message: "OTP verified successfully",
            data: verify,
        };
    }
}























