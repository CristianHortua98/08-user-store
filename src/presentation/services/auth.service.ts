import { bcryptAdapter, envs, JwtAdapter } from '../../config';
import { UserModel } from '../../data';
import { CustomError, UserEntity } from '../../domain';
import { RegisterUserDto } from '../../domain/dtos/auth/register-user.dto';
import { LoginUserDto } from '../../domain/dtos/auth/login-user.dto';
import { EmailService } from './email.service';


export class AuthService {

    constructor(
        private readonly emailService: EmailService
    ){}

    public async registerUser(registerUserDto: RegisterUserDto){

        const existUser = await UserModel.findOne({
            email: registerUserDto.email
        });

        if(existUser){
            throw CustomError.badRequest('Email already exist');
        }

        try{

            const user = new UserModel(registerUserDto);
            
            //Encriptar contrasena
            user.password = bcryptAdapter.hash(registerUserDto.password);
            
            await user.save();            

            //Email Confirmacion
            await this.sendEmailValidationLink(user.email);

            const {password, ...userEntity} = UserEntity.fromObject(user);

            const token = await JwtAdapter.generateToken({id: user.id});
            if(!token){
                throw CustomError.internalServer('Error while creating JWT');
            }

            return {
                user: userEntity,
                token: token
            };

        }catch(error){
            throw CustomError.internalServer(`${error}`);
        }

        return 'todo ok';

    }

    public async loginUser(loginUserDto: LoginUserDto){

        const user = await UserModel.findOne({
            email: loginUserDto.email
        });

        if(!user){
            throw CustomError.badRequest('Email not exist');
        }

        const isMatch = bcryptAdapter.compare(loginUserDto.password, user.password);

        if(!isMatch){
            throw CustomError.badRequest('Password incorrect');
        }

        const { password, ...userData } = UserEntity.fromObject(user);


        const token = await JwtAdapter.generateToken({id: user.id});
        if(!token){
            throw CustomError.internalServer('Error while creating JWT');
        }

        return {
            user: userData,
            token: token
        }

    }

    public async validateEmail(token: string) {

        const payload = await JwtAdapter.validateToken(token);

        if(!payload){
            throw CustomError.unauthorized('Invalidad token');
        }

        const { email } = payload as {email: string};
        if(!email){
            throw CustomError.internalServer('Email not in token');
        }

        const user = await UserModel.findOne({email});

        if(!user){
            throw CustomError.internalServer('Email not exist');
        }

        user.emailValidated = true;
        await user.save();

        return true;
        
    }

    private sendEmailValidationLink = async (email: string) => {

        const token = await JwtAdapter.generateToken({email});
        if(!token){
            throw CustomError.internalServer('Error getting token');
        }

        const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;

        const html = `

            <h1>Validate your Email</h1>

            <p>Clickk on the following link to validate your email</p>
            <a href="${link}">Validate your email: ${email}</a>
        
        `;

        const options = {
            to: email,
            subject: 'Validate your email',
            htmlBody: html
        }

        const isSent = await this.emailService.sendEmail(options);

        if(!isSent){
            throw CustomError.internalServer('Error sending email');
        }

        return true;

    }

}