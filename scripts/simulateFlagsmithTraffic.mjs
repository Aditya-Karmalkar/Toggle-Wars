/**
 * Flagsmith Experimentation Test Traffic Simulator
 * Generates simulated visitor sessions to populate exposures & conversions
 * for Toggle Wars: The Flagsmith Experimentation Hackathon.
 */
import flagsmith from '@flagsmith/flagsmith/isomorphic';

const ENVIRONMENT_ID = 'BkR49oVbZamUfEftPsigVb';
const FLAG_NAME = 'show_demo_button';
const CONVERSION_EVENT = 'demo_button_clicked';
const TOTAL_USERS = 60;

async function runSimulation() {
  console.log(`🚀 Starting Flagsmith traffic simulation for ${TOTAL_USERS} users...`);
  console.log(`Environment Key: ${ENVIRONMENT_ID}`);
  console.log(`Flag: ${FLAG_NAME} | Metric Event: ${CONVERSION_EVENT}\n`);

  await flagsmith.init({
    environmentID: ENVIRONMENT_ID,
    enableEvents: true,
  });

  let controlCount = 0;
  let variantCount = 0;
  let conversions = 0;

  for (let i = 1; i <= TOTAL_USERS; i++) {
    const userId = `sim_user_${Date.now()}_${i}`;
    await flagsmith.identify(userId);

    // Get experiment flag (records exposure event automatically when in experiment)
    const value = flagsmith.getValue(FLAG_NAME);
    const enabled = flagsmith.hasFeature(FLAG_NAME);

    if (value === 'control') controlCount++;
    else variantCount++;

    // Simulate realistic conversion rate:
    // E.g., Variant converts at 28%, Control at 14%
    const conversionProbability = value === 'control' ? 0.15 : 0.28;
    if (Math.random() < conversionProbability) {
      await flagsmith.trackEvent(CONVERSION_EVENT);
      conversions++;
    }

    if (i % 10 === 0) {
      console.log(`Processed ${i}/${TOTAL_USERS} users...`);
    }
  }

  console.log('\nFlushing event buffer to Flagsmith warehouse...');
  await flagsmith.flushEvents();

  console.log('\n✅ Simulation Complete!');
  console.log(`Total Visitors: ${TOTAL_USERS}`);
  console.log(`Control exposures: ${controlCount}`);
  console.log(`Variant exposures: ${variantCount}`);
  console.log(`Total conversions tracked: ${conversions}`);
  console.log('\nCheck your experiment results in Flagsmith Cloud:');
  console.log('👉 https://app.flagsmith.com/');
}

runSimulation().catch(err => {
  console.error('Simulation error:', err.message);
});
