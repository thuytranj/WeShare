import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID', 'placeholder-github-client-id'),
      clientSecret: configService.get<string>(
        'GITHUB_CLIENT_SECRET',
        'placeholder-github-client-secret',
      ),
      callbackURL: configService.get<string>(
        'GITHUB_CALLBACK_URL',
        'http://localhost:3000/api/v1/auth/github/callback',
      ),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ): Promise<any> {
    const { id, displayName, username, emails, photos } = profile;
    const email = emails?.[0]?.value || `${username}@users.noreply.github.com`;
    const user = {
      provider: 'github' as const,
      providerId: id,
      email,
      fullName: displayName || username || 'GitHub User',
      avatarUrl: photos?.[0]?.value || null,
    };
    done(null, user);
  }
}
