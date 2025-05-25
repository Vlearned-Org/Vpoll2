import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserRepository } from '../src/data/repositories/user.repository';
import { PasswordUtils } from '../src/core/auth/managers/password.utils';

async function fixLegacyUserPasswords() {
  console.log('🔧 Starting legacy user password fix...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepo = app.get(UserRepository);
  
  try {
    // Find all legacy users
    const legacyUsers = await userRepo.find({
      isLegacyUser: true
    });
    
    console.log(`📊 Found ${legacyUsers.length} legacy users`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const user of legacyUsers) {
      try {
        // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
        if (user.password && (user.password.startsWith('$2b$') || user.password.startsWith('$2a$'))) {
          console.log(`⏭️  Skipping user ${user.nric} - password already hashed`);
          skippedCount++;
          continue;
        }
        
        // Check if password exists and is not empty
        if (!user.password || user.password.trim() === '') {
          console.log(`⚠️  Warning: User ${user.nric} has no password - skipping`);
          skippedCount++;
          continue;
        }
        
        console.log(`🔨 Fixing password for user: ${user.nric}`);
        
        // Hash the plain text password using the same method as the system
        const hashedPassword = await PasswordUtils.hash(user.password, true);
        
        // Update the user with the hashed password
        await userRepo.setPassword(user._id.toString(), hashedPassword);
        
        console.log(`✅ Fixed password for user: ${user.nric}`);
        fixedCount++;
        
      } catch (error) {
        console.error(`❌ Error fixing password for user ${user.nric}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Fixed: ${fixedCount} users`);
    console.log(`   ⏭️  Skipped: ${skippedCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📊 Total processed: ${legacyUsers.length} users`);
    
    if (fixedCount > 0) {
      console.log('\n🎉 Legacy user password migration completed successfully!');
    } else {
      console.log('\n✨ No legacy users needed password fixes.');
    }
    
  } catch (error) {
    console.error('💥 Fatal error during migration:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the migration
fixLegacyUserPasswords()
  .then(() => {
    console.log('🏁 Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });