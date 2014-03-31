class StoriesController < ApplicationController
  before_filter :authenticate_user!
  # GET /stories
  # GET /stories.json
  def index
    #@usemap = true
    @stories = Story.where(:user_id => current_user.id)

    respond_to do |format|
      format.html  #index.html.erb
      format.json { render json: @stories }
    end
  end


  # GET /stories/1
  # GET /stories/1.json
  def show

    @story = Story.find(params[:id])

    respond_to do |format|
      format.html  #show.html.erb
      format.json { render json: @story }
    end
  end

  # GET /stories/new
  # GET /stories/new.json
  def new
    @story = Story.new(:user_id => current_user.id)

    respond_to do |format|
        format.html #new.html.erb
      format.json { render json: @story }
    end
  end

  # GET /stories/1/edit
  def edit
    @story = Story.find(params[:id])
  end

  # POST /stories
  # POST /stories.json
  def create
    @story = Story.new(params[:story])

    respond_to do |format|
      if @story.save
        format.html { redirect_to sections_story_path(@story), notice: 'Story was successfully created.' }
        format.json { render json: @story, status: :created, location: @story }
      else
        format.html { render action: "new" }
        format.json { render json: @story.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /stories/1
  # PUT /stories/1.json
  def update
    @story = Story.find(params[:id])

    respond_to do |format|
      if @story.update_attributes(params[:story])
        format.html { redirect_to  sections_story_path(@story),  notice: 'Story was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @story.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /stories/1
  # DELETE /stories/1.json
  def destroy
    @story = Story.find(params[:id])
    @story.destroy

    respond_to do |format|
      format.html { redirect_to stories_url }
      format.json { head :ok }
    end
  end
 




  def get_data
    type = params[:type]

    if type == 's'

      if params[:command]!='n'
        @item = Section.find_by_id(params[:section_id])    
      else 
        @item = Section.new(story_id: params[:id])
      end  
           
      respond_to do |format|
        format.js { render :action => "get_section" }
      end

    elsif type == 'c'

      if params[:command]!='n'
        @item = Content.find_by_id(params[:item_id])
      else 
        @item = Content.new(:section_id => params[:section_id], :content => '')
      end
      respond_to do |format|
        format.js  {render :action => "get_content" }
      end

    elsif type == 'm'

        if params[:command]!='n'    
          @item = Medium.find_by_id(params[:item_id])   
        else 
          @item = Medium.new(:section_id => params[:section_id])
        end
        respond_to do |format|
          format.js {render :action => "get_media" }
        end

    end
  end



  def new_section
     @item = Section.new(params[:section])        
     respond_to do |format|
        if @item.save                    
          flash[:success] =u t('app.msgs.success_created', obj:Section.model_name.human)
          format.js { render action: "change_tree", status: :created  }
        else          
          flash[:error] = u t('app.msgs.error_created', obj:Section.model_name.human, err:@item.errors.full_messages.to_sentence)                  
          format.js {render json: nil, status: :ok }
        end
      end    
  end

 def new_media
    @item = Medium.new(params[:medium])       
    respond_to do |format|
        if @item.save          
          flash[:success] =u t('app.msgs.success_created', obj:Media.model_name.human)
          format.js { render action: "change_sub_tree", status: :created }                    
        else          
          flash[:error] = "Media wasn't updated, please try again later"            
          format.js {render json: nil, status: :ok }
        end
      end    
  end



    def new_content    
     @item = Content.new(params[:content])   
     @flash = flash
     respond_to do |format|
        if @item.save
          flash[:success] =u t('app.msgs.success_created', obj:Content.model_name.human)
          format.js { render action: "change_sub_tree", status: :created  }
        else
          flash[:error] = u t('app.msgs.error_created', obj:Content.model_name.human, err:@item.errors.full_messages.to_sentence)                  
          format.js {render json: nil, status: :unprocessable_entity }       
        end
      end    
  end
  

  def save_section      
    @item = Section.find_by_id(params[:section][:id])  
     respond_to do |format|
          if @item.update_attributes(params[:section])
          flash[:success] =u t('app.msgs.success_updated', obj:Section.model_name.human)
          format.js {render action: "build_tree", status: :created }                  
        else
          flash[:error] = "Section wasn't updated, please try again later"            
          format.js {render json: nil, status: :unprocessable_entity }      
        end
      end    
  end
  def save_content      
     @item = Content.find_by_id(params[:content][:id])  
     respond_to do |format|
        if @item.update_attributes(params[:content])
          flash[:success] =u t('app.msgs.success_updated', obj:Content.model_name.human)
          format.js {render action: "build_tree", status: :created }                  
        else
          flash[:error] = "Content wasn't updated, please try again later"            
          format.js {render json: nil, status: :unprocessable_entity }      
        end
      end    
  end
 def save_media
    @item = Medium.find_by_id(params[:medium][:id])
    respond_to do |format|
        if @item.update_attributes(params[:medium])          
          flash[:success] =u t('app.msgs.success_updated', obj:Media.model_name.human)
          format.js {render action: "build_tree", status: :created }          
        else          
          flash[:error] = "Media wasn't updated, please try again later"            
          format.js {render json: nil, status: :unprocessable_entity }
        end
      end    
  end
    
  def destroy_tree_item  
    item = nil    
    type = params[:type]
    if type == 's'
      item = Section.find_by_id(params[:section_id])               
    elsif type == 'c'
      item =  Content.find_by_id(params[:item_id])      
    elsif type == 'm'      
      item = Medium.find_by_id(params[:item_id])           
    end

    item.destroy
    
   respond_to do |format|
      if item.destroyed?   
          flash[:success] = "Item was removed from the tree."
          format.json { render json: nil , status: :created } 
      else  
          flash[:error] = "Removing data failed [" +  @item.errors.full_messages.to_sentence + "]"            
          format.json {render json: nil, status: :unprocessable_entity }  
      end
    end
  end
  def up      
    if params[:i] == '-1'
      Section.where(story_id: params[:id]).find_by_id(params[:s]).move_higher            
    else
      Medium.where(section_id: params[:s]).find_by_id(params[:i]).move_higher            
    end
    render json: nil , status: :created    
  end
  def down  
     if params[:i] == '-1'
      Section.where(story_id: params[:id]).find_by_id(params[:s]).move_lower            
    else
      Medium.where(section_id: params[:s]).find_by_id(params[:i]).move_lower            
    end            
    render json: nil , status: :created    
  end

  def sections
      @story = Story.fullsection(params[:id])   
  end

  def imageupload  
    # Take upload from params[:file] and store it somehow...
    # Optionally also accept params[:hint] and consume if needed
    logger.debug("---------------------------------------------------")
    logger.debug("---------------------------------------------------#{params}")
    render json: {
      image: {
        url: view_context.image_url(image)
      }
    }, content_type: "text/html"
  
  end
  #logger.debug("---------------------------------------------------#{params}")
end       