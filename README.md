**To use our application, you need [X-editable](http://vitalets.github.io/x-editable/assets/zip/jquery-editable-1.5.1.zip), [Jquery](https://jquery.com/download/), [Poshytip](http://vadikom.com/files/?file=poshytip/poshytip-1.2.zip). You can use these libraries in the script folder and make sure the paths in index.html is correct. Otherwise, you can download these libraries online and other libraries if needed.

Our single page application, InfinitySort, is an information management tool that allows users to sort and categorize their notes, data and personal information by doing affinity diagram. In real life, affinity diagram method is used broadly in information technology and user experience design. “In affinity diagramming, items, such as ideas, interview quotes and observations, are written down on separate notes, which are placed one by one on a surface such as a table or a wall. As the notes are placed,and in moving them around later, they are clustered based on their affinity: their similarity or relevance to a shared topic (Harboe & Huang, 2015).” Our application tries to mimic these process on a webpage and provides flexible editing and collaborating features. 

Our target users are user experience designers and other people who often use affinity diagram in their study and in their work. Based on user research, we found that traditional affinity diagramming has some limitations. For example, it is not convenient for a user to conduct remote collaboration. The best way for a team to use affinity diagram is having everyone sitting together in a room with whiteboard,markers and sticky notes. Nowadays, however, User Experience professionals always are required to collaborate with colleagues working in other locations; therefore, they seek an affinity diagram tool that can allow them to collaborate through internet. Another limitation of traditional affinity diagramming is that the notes can be unwieldy moved (Wilson, 2012), and designers have to take photos of a finished diagram for further reference. They won't be able to access or change the original diagram after a meeting. 

However, our application can help our users to solve these problems. By using itemMirror, our users can directly save their diagrams to the Dropbox and they don’t need to carry sticky notes or take photos any more. To share a diagram to others, they can easily share the certain Dropbox folder with the team members so that when the members open the diagram in our application, they can work on the diagram as well. 

To stimulate the process of creating affinity diagram on notes and board, we applied the absolute positioning horizontal service to InfinitySort to provide features including 1) dragging and dropping sticky notes to form categories, and 2) assigning name label to each category. Compared to the existing online affinity diagramming tools that assign fixed positions to sticky notes and categories, absolute positioning service built in InfinitySort makes our application become more competitive and usable. Another uniqueness of InfinitySort is group editing. Users can modify the position and color of a group of sticky notes and its category label by only one click. This features help users to visually differentiate each note clusters. Under the consideration of the screen size limitation, we implemented a feature that allows users to unfold all notes in certain category; so that users can avoid the overlapping issues appeared when having a large amount of notes, and have better reading experience when they are reviewing the contents written on the notes.

Our application uses the folder structure provided by Dropbox and powered by itemMirror. Every affinity diagram is a folder in the Dropbox; each sticky note and category label are the phantom associations under a affinity diagram folder. We use “type” namespace attribute to differentiate notes and categories since they play different roles in a diagram. We also used the positionX and positionY namespace attributes to save the position of a sticky note and category label, and use customColor and borderColor to modify colors of sticky notes and labels. These namespace attributes are unique, so that InfinitySort will not change or delete the associations or the namespace attributes created by other apps and vice versa. Yet, if the users want to use the associations created by other apps, they can easily add our namespaces and then edit them in InfinitySort.

We also implemented user experience design solution in our application. First of all, we did UI design and improved the color, formatting and interface layout along with the project process. We believe  interface is very important, because  this gives the first impression to users. In addition, we want to make our application as intuitive as possible. For example, we added instructions to all button icons. When users hover their mouse over a button icon, the instruction of this button shows, so that users can understand function of the button by this one-step instruction. Secondly, we did user testing along and after our development process. We invited our potential users who are our classmates pursuing the user experience specialization to test our application and to give us suggestions on the interface and function design. We took their suggestions and further  improved InfinitySort. Thirdly, we tested InfinitySort on several major browsers, such as Firefox and Chrome, and it maintains a good consistence among these browsers.

Features of our application:
Priority 1: (1) Create and delete diagrams, sticky notes and categories. (2) Edit display name of diagram, sticky note, and category. (3) List sticky notes and categories in the “Sticky notes” and “Category name” areas with relative positions. (4) Drag and drop notes in the “Whiteboard” area with absolute positions. 
Priority 2: (1) Open an existed diagram and display all of the sticky notes and categories inside it based on their position namespace attributes. (2) Drag and drop sticky notes and categories from the “Sticky notes” and “Category name” areas to the “Whiteboard” area. The notes and categories are relative positioned when they are in the “Sticky notes” and “Category name” areas and are absolute positioned when they are placed in the “Whiteboard” area. (3) Change color of sticky notes and categories.
Priority 3: (1) After categorized sticky notes to a certain category, drag and drop the cluster as a whole in the “Whiteboard” area. (2) When changing the color of a category, the color of all of the sticky notes in the category changed. (3) Zoom in a category to view all of the sticky notes in it. Show the previous view when zooming out. (4) Reset all sticky notes’ position to their default position,  listing in “Sticky Note” cavans area; and reset all sticky notes’ color to default color (yellow). (5) Delete all sticky notes by one click.
Current status: Features under all three priority categories are fully implemented.

Reference:
Harboe, G., & Huang, E. M. (2015). Real-World Affinity Diagramming Practices: Bridging the Paper-Digital Gap. CHI '15 Proceedings of the 33rd Annual ACM Conference on Human Factors in Computing Systems . New York: ACM.
Wilson, C. (2012, December 12). 100 User Experience (UX) Design and Evaluation Methods for Your Toolkit: Method 22 of 100: Affinity Diagramming. Retrieved June 07, 2015, from Designing the User Experience at Autodesk: http://dux.typepad.com/dux/2011/01/method-1-of-100-concept-interviews-100-user-experience-ux-design-and-evaluation-methods-for-your-too.html
 
 

