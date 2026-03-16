import express from 'express';
import supabase from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { edition_id } = req.query;
    let query = supabase.from('episodes').select('*').order('created_at', { ascending: false });
    
    if (edition_id) {
      query = query.eq('edition_id', edition_id);
    }
    
    const { data: episodes, error } = await query;
    
    if (error) throw error;

    // For each episode, get speakers and questions
    const episodesWithSpeakers = await Promise.all(
      (episodes || []).map(async (episode) => {
        // Get speakers for this episode
        const { data: episodeSpeakers } = await supabase
          .from('episode_speakers')
          .select('speaker_id')
          .eq('episode_id', episode.id);

        const speakerIds = episodeSpeakers?.map(es => es.speaker_id) || [];

        let speakers = [];
        if (speakerIds.length > 0) {
          const { data: speakerData } = await supabase
            .from('speakers')
            .select('*')
            .in('id', speakerIds);
          speakers = speakerData || [];
        }

        // Get questions for this episode
        const { data: questions } = await supabase
          .from('questions')
          .select('*')
          .eq('episode_id', episode.id);

        // Attach questions to speakers
        const speakersWithQuestions = speakers.map(speaker => ({
          ...speaker,
          questions: questions?.filter(q => q.speaker_id === speaker.id).map(q => q.question_text) || []
        }));

        return { ...episode, speakers: speakersWithQuestions };
      })
    );

    res.json(episodesWithSpeakers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data: episode, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;

    // Get speakers for this episode
    const { data: episodeSpeakers } = await supabase
      .from('episode_speakers')
      .select('speaker_id')
      .eq('episode_id', req.params.id);

    const speakerIds = episodeSpeakers?.map(es => es.speaker_id) || [];

    let speakers = [];
    if (speakerIds.length > 0) {
      const { data: speakerData } = await supabase
        .from('speakers')
        .select('*')
        .in('id', speakerIds);
      speakers = speakerData || [];
    }

    // Get questions for each speaker in this episode
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('episode_id', req.params.id);

    // Attach questions to speakers
    const speakersWithQuestions = speakers.map(speaker => ({
      ...speaker,
      questions: questions?.filter(q => q.speaker_id === speaker.id).map(q => q.question_text) || []
    }));

    res.json({ ...episode, speakers: speakersWithQuestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { edition_id, title, description, youtube_url, duration, added_date, thumbnail_url, speakers } = req.body;
    const { data, error } = await supabase
      .from('episodes')
      .insert([{ 
        edition_id, 
        title, 
        description, 
        youtube_url, 
        duration, 
        added_date, 
        thumbnail_url
      }])
      .select()
      .single();
    
    if (error) throw error;

    // Add speakers and questions if provided
    if (speakers && Array.isArray(speakers) && data) {
      for (const speaker of speakers) {
        if (!speaker.name) continue;
        
        const { data: newSpeaker } = await supabase
          .from('speakers')
          .insert({
            edition_id,
            name: speaker.name,
            role: speaker.role || null,
            linkedin: speaker.linkedin || null,
            country: speaker.country || null,
            location: speaker.location || null,
            photo_url: speaker.photo_url || null
          })
          .select()
          .single();

        if (newSpeaker?.id) {
          await supabase.from('episode_speakers').insert({
            episode_id: data.id,
            speaker_id: newSpeaker.id
          });

          if (speaker.questions && Array.isArray(speaker.questions)) {
            for (const questionText of speaker.questions) {
              if (questionText && questionText.trim()) {
                await supabase.from('questions').insert({
                  episode_id: data.id,
                  speaker_id: newSpeaker.id,
                  question_text: questionText
                });
              }
            }
          }
        }
      }
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, youtube_url, duration, added_date, thumbnail_url, speakers } = req.body;
    const { data, error } = await supabase
      .from('episodes')
      .update({ 
        title, 
        description, 
        youtube_url, 
        duration, 
        added_date, 
        thumbnail_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;

    // Update speakers and questions if provided
    if (speakers && Array.isArray(speakers)) {
      // Get existing episode_speakers
      const { data: existingEpisodeSpeakers } = await supabase
        .from('episode_speakers')
        .select('speaker_id')
        .eq('episode_id', req.params.id);
      
      const existingSpeakerIds = new Set(existingEpisodeSpeakers?.map(es => es.speaker_id) || []);
      const newSpeakerIds = new Set();

      // Process each speaker from request
      for (const speaker of speakers) {
        if (!speaker.name) continue;
        
        let speakerId = speaker.id;
        
        if (!speakerId || speakerId === '') {
          // Check if speaker with same name already exists for this edition
          const { data: existingSpeaker } = await supabase
            .from('speakers')
            .select('id')
            .eq('edition_id', data.edition_id)
            .eq('name', speaker.name)
            .maybeSingle();
          
          if (existingSpeaker) {
            speakerId = existingSpeaker.id;
            // Update existing speaker details
            await supabase.from('speakers').update({
              name: speaker.name,
              role: speaker.role || null,
              linkedin: speaker.linkedin || null,
              country: speaker.country || null,
              location: speaker.location || null,
              photo_url: speaker.photo_url || null
            }).eq('id', speakerId);
          } else {
            // Create new speaker
            const { data: newSpeaker } = await supabase
              .from('speakers')
              .insert({
                edition_id: data.edition_id,
                name: speaker.name,
                role: speaker.role || null,
                linkedin: speaker.linkedin || null,
                country: speaker.country || null,
                location: speaker.location || null,
                photo_url: speaker.photo_url || null
              })
              .select()
              .single();
            speakerId = newSpeaker?.id;
          }
        } else {
          // Update existing speaker details
          await supabase.from('speakers').update({
            name: speaker.name,
            role: speaker.role || null,
            linkedin: speaker.linkedin || null,
            country: speaker.country || null,
            location: speaker.location || null,
            photo_url: speaker.photo_url || null
          }).eq('id', speakerId);
        }

        if (speakerId) {
          newSpeakerIds.add(speakerId);
          
          // Add to episode_speakers if not already there
          if (!existingSpeakerIds.has(speakerId)) {
            await supabase.from('episode_speakers').insert({
              episode_id: req.params.id,
              speaker_id: speakerId
            });
          }

          // Delete existing questions for this speaker in this episode
          await supabase.from('questions').delete()
            .eq('episode_id', req.params.id)
            .eq('speaker_id', speakerId);

          // Add questions for this speaker
          if (speaker.questions && Array.isArray(speaker.questions)) {
            for (const questionText of speaker.questions) {
              if (questionText && questionText.trim()) {
                await supabase.from('questions').insert({
                  episode_id: req.params.id,
                  speaker_id: speakerId,
                  question_text: questionText
                });
              }
            }
          }
        }
      }

      // Remove speakers that are no longer in the list
      for (const oldSpeakerId of existingSpeakerIds) {
        if (!newSpeakerIds.has(oldSpeakerId)) {
          await supabase.from('episode_speakers').delete()
            .eq('episode_id', req.params.id)
            .eq('speaker_id', oldSpeakerId);
        }
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Episode deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Episode Speakers routes
router.get('/:id/speakers', async (req, res) => {
  try {
    const { data: episodeSpeakers } = await supabase
      .from('episode_speakers')
      .select('speaker_id')
      .eq('episode_id', req.params.id);

    const speakerIds = episodeSpeakers?.map(es => es.speaker_id) || [];

    if (speakerIds.length === 0) {
      return res.json([]);
    }

    const { data: speakers, error } = await supabase
      .from('speakers')
      .select('*')
      .in('id', speakerIds);

    if (error) throw error;

    // Get questions for each speaker
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('episode_id', req.params.id);

    const speakersWithQuestions = speakers.map(speaker => ({
      ...speaker,
      questions: questions?.filter(q => q.speaker_id === speaker.id).map(q => q.question_text) || []
    }));

    res.json(speakersWithQuestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/speakers', async (req, res) => {
  try {
    const { speaker_id } = req.body;
    const { data, error } = await supabase
      .from('episode_speakers')
      .insert([{ episode_id: req.params.id, speaker_id }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/speakers/:speakerId', async (req, res) => {
  try {
    const { error } = await supabase
      .from('episode_speakers')
      .delete()
      .eq('episode_id', req.params.id)
      .eq('speaker_id', req.params.speakerId);
    
    if (error) throw error;
    res.json({ message: 'Speaker removed from episode' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Questions routes
router.get('/:id/questions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('episode_id', req.params.id);
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/questions', async (req, res) => {
  try {
    const { speaker_id, question_text } = req.body;
    const { data, error } = await supabase
      .from('questions')
      .insert([{ 
        episode_id: req.params.id, 
        speaker_id, 
        question_text 
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/questions/:questionId', async (req, res) => {
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', req.params.questionId);
    
    if (error) throw error;
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
