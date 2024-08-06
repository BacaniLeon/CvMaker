<template>
  <div v-show="isVisible">
    <h1>CV Maker</h1>

    <form id="cvForm">
      <label>First and Last name*</label>
      <input type="text" v-model="fullName" required/>

      <label>Title*</label>
      <input type="text" v-model="title" required/>

      <label>Email*</label>
      <input type="email" v-model="email" required/>

      <label>Phone*</label>
      <input type="tel" v-model="phone" required/>

      <label>Address*</label>
      <input type="text" v-model="address"/>

      <label>About me*</label>
      <textarea name="description" form="cvForm" v-model="description" required></textarea>

      <label>Add picture</label>
      <input type="file" @change="onFileChange"/>
      
      <label>Skills</label>
      <div v-for="(skill, index) in skills" :key="index" class="div__Skills">
        <input type="text" class="input__Skills" v-model="skills[index]"/>
        <button type="button" class="button" @click="removeSkill(index)">Remove</button>
      </div>
      <button type="button" class="addButton button" @click="addSkill">Add Skill</button>

      <label>Certifications</label>
      <div v-for="(certification, index) in certifications" :key="index" class="div__Certifications">
        <input type="text" v-model="certifications[index]" class="input__Certifications"/>
        <button type="button" class="button" @click="removeCertification(index)">Remove</button>
      </div>
      <button type="button" class="addButton button" @click="addCertification">Add Certification</button>

      <label>Experience</label>
      <div v-for="(experience, index) in experiences" :key="index" class="div__Experience">
        <input type="text" v-model="experiences[index].title" placeholder="Job Title" />
        <input type="text" v-model="experiences[index].durationStart" placeholder="Start Date" />
        <input type="text" v-model="experiences[index].durationEnd" placeholder="End Date" />
        <textarea v-model="experiences[index].description" placeholder="Description" ></textarea>
        <button type="button" class="button" @click="removeExperience(index)">Remove</button>
      </div>
      <button type="button" class="addButton  button" @click="addExperience">Add Experience</button>

      <label>Education</label>
      <div v-for="(educationItem, index) in education" :key="index" class="div__Education">
        <input type="text" v-model="education[index].school" placeholder="School Name" />
        <input type="text" v-model="education[index].degree" placeholder="Degree" />
        <input type="text" v-model="education[index].durationStart" placeholder="Start Date" />
        <input type="text" v-model="education[index].durationEnd" placeholder="End Date" />
        <textarea v-model="education[index].description" placeholder="Description" ></textarea>
        <button type="button" class="button" @click="removeEducation(index)">Remove</button>
      </div>
      <button type="button" class="addButton button" @click="addEducation">Add Education</button>
    </form>
    
    <div class="button__Div">
      <button class="previewCvButton fancyButton" @click="handleGetPdfClick">Get PDF</button>
    </div>
  </div>

  <div class="mainCv__Div" v-show="!isVisible">
    <div class="background__Div">
      <div class="fancyButton__Div">
        <button @click="exportToPdf" class="fancyButton">Export as PDF</button>
        <button @click="toggleVisibility" class="fancyButton">Edit more</button>
      </div>
      <div class="resume__Wrapper">
        <div class="resume" id="idResume">
          <div class="left-part">
            <div class="resume-section">
              <img :src="imageUrl" class="profile-picture">

              <h4 class="headliner">About Me</h4>
              <div class="div__Description">{{ description }}</div>
            </div>

            <div class="resume-section">
              <h4 class="headliner">Contact</h4>
              <ul>
                <li>{{ phone }}</li>
                <li>{{ email }}</li>
                <li>{{ address }}</li>
              </ul>
            </div>

            <div class="resume-section">
              <h4 class="headliner">Skills</h4>
              <ul>
                <li v-for="(skill, index) in skills" :key="index">{{ skill }}</li>
              </ul>
            </div>

            <div class="resume-section">
              <h4 class="headliner">Certifications</h4>
              <ul>
                <li v-for="(certification, index) in certifications" :key="index">{{ certification }}</li>
              </ul>
            </div>
          </div>

          <div class="right-part">
            <div class="name">{{ fullName }}</div>
            <div class="title">{{ title }}</div>

            <h4 class="headliner">Experience</h4>
            <div v-for="(experience, index) in experiences" :key="index" class="div__Experience mobile">
              <h5>{{ experience.title }} </h5>
              <h6>{{ experience.durationStart }} - {{ experience.durationEnd }}</h6> 
              <div>{{ experience.description }}</div>
            </div>

            <h4 class="headliner">Education</h4>
            <div v-for="(educationItem, index) in education" :key="index" class="div__Education mobile">
              <h5>{{ educationItem.school }} - {{ educationItem.degree }}</h5>
              <h6>{{ educationItem.durationStart }} - {{ educationItem.durationEnd }}</h6>
              <div>{{ educationItem.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

const isVisible = ref(true);
const imageUrl = ref('');
const fullName = ref('');
const email = ref('');
const phone = ref('');
const address = ref('');
const description = ref('');
const skills = ref(['']);
const certifications = ref(['']);
const experiences = ref([{ title: '', durationStart: '', durationEnd: '', description: '' }]);
const education = ref([{ school: '', degree: '', durationStart: '', durationEnd: '', description: '' }]);
const title = ref('');

const isFormValid = computed(() => {
  return fullName.value && title.value && email.value && phone.value && address.value && description.value
  
});

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
};

const handleGetPdfClick = () => {
  if (!isFormValid.value) {
    alert("All fields with * need to be filled");
    return;
  }
  toggleVisibility();
};

const exportToPdf = async () => {
  await nextTick();

  const resume = document.getElementById('idResume');
  if (resume) {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const options = {
        filename: 'CV.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 1 },
        jsPDF: { unit: 'mm', format: [210, 297], orientation: 'portrait' }
      };

      html2pdf().from(resume).set(options).save();
    } catch (error) {
      console.error('Error loading html2pdf:', error);
    }
  } else {
    console.error("Element with id 'idResume' not found.");
  }
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      imageUrl.value = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const addSkill = () => {
  skills.value.push('');
};

const removeSkill = (index) => {
  skills.value.splice(index, 1);
};

const addCertification = () => {
  certifications.value.push('');
};

const removeCertification = (index) => {
  certifications.value.splice(index, 1);
};

const addExperience = () => {
  experiences.value.push({ title: '', durationStart: '', durationEnd: '', description: '' });
};

const removeExperience = (index) => {
  experiences.value.splice(index, 1);
};

const addEducation = () => {
  education.value.push({ school: '', degree: '', durationStart: '', durationEnd: '', description: '' });
};

const removeEducation = (index) => {
  education.value.splice(index, 1);
};

const handleBeforeUnload = (event) => {
  event.preventDefault();
  event.returnValue = '';
};

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

